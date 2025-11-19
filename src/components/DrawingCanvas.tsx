import { useEffect, useRef, useState } from 'react';
import { Canvas, Circle, Rect, Triangle, Line, Path, IText, Ellipse, FabricObject } from 'fabric';
import { DrawingSettings, DrawnShape, ShapeConnection } from '../types/drawing';
import { ShapeRecognizer } from '../utils/shapeRecognitionv3';

interface DrawingCanvasProps {
  settings: DrawingSettings;
  isDrawingMode: boolean;
  width: number;
  height: number;
}

export function DrawingCanvas({ settings, isDrawingMode, width, height }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);
  const [drawnShapes, setDrawnShapes] = useState<DrawnShape[]>([]);
  const connectionsRef = useRef<ShapeConnection[]>([]);
  const drawingPathRef = useRef<{ x: number; y: number }[]>([]);
  const isDrawingRef = useRef(false);
  const currentPathRef = useRef<Path | null>(null);
  const connectingFromRef = useRef<DrawnShape | null>(null);
  const currentShapeRef = useRef<FabricObject | null>(null);
  const startPointRef = useRef<{ x: number; y: number } | null>(null);

  // Initialize Fabric canvas
  useEffect(() => {
    if (!isDrawingMode || !canvasRef.current || fabricCanvasRef.current) return;

    console.log('Initializing Fabric canvas...');
    console.log('Canvas element:', canvasRef.current);
    console.log('Window dimensions:', window.innerWidth, 'x', window.innerHeight);

    // Get actual dimensions from parent container
    const container = canvasRef.current.parentElement;
    if (!container) {
      console.error('[DrawingCanvas] No parent container found');
      return;
    }

    const actualWidth = container.clientWidth;
    const actualHeight = container.clientHeight;

    console.log('Canvas will be:', actualWidth, 'x', actualHeight);

    try {
      const canvas = new Canvas(canvasRef.current, {
        width: actualWidth,
        height: actualHeight,
        backgroundColor: '#ffffff',
        selection: settings.tool === 'select',
        renderOnAddRemove: true,
        enableRetinaScaling: true,
      });

      fabricCanvasRef.current = canvas;
      console.log('Fabric canvas initialized:', {
        width: canvas.width,
        height: canvas.height,
        backgroundColor: canvas.backgroundColor,
      });

      // Verify event listener capability
      console.log('Canvas event listeners available:', typeof canvas.on === 'function');

      canvas.renderAll();
    } catch (error) {
      console.error('Error initializing Fabric canvas:', error);
    }

    return () => {
      console.log('Disposing Fabric canvas...');
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };
  }, [isDrawingMode]);

  // Update drawing mode and tool
  useEffect(() => {
    console.log('[Tool Setup] Starting tool setup effect', { tool: settings.tool, isDrawingMode });
    const canvas = fabricCanvasRef.current;
    if (!canvas) {
      console.log('[Tool Setup] Canvas not ready yet');
      return;
    }

    console.log('[Tool Setup] Setting up tool:', settings.tool);

    // Update canvas dimensions if they changed
    if (width && height && (canvas.width !== width || canvas.height !== height)) {
      console.log('[Tool Setup] Updating canvas dimensions to', width, 'x', height);
      canvas.setDimensions({ width, height });
    }

    canvas.selection = settings.tool === 'select';
    canvas.isDrawingMode = false;

    // Remove all event listeners
    console.log('[Tool Setup] Removing old event listeners');
    canvas.off('mouse:down');
    canvas.off('mouse:move');
    canvas.off('mouse:up');

    if (!isDrawingMode) {
      canvas.defaultCursor = 'default';
      console.log('[Tool Setup] Drawing mode off, returning');
      return;
    }

    console.log('[Tool Setup] Drawing mode on, setting up drawing tool:', settings.tool);

    switch (settings.tool) {
      case 'select':
        canvas.defaultCursor = 'default';
        setupSelectMode(canvas);
        break;
      case 'pencil':
      case 'brush':
        console.log('[Tool Setup] Setting up freehand drawing');
        canvas.defaultCursor = 'crosshair';
        setupFreehandDrawing(canvas);
        console.log('[Tool Setup] Freehand drawing setup complete');
        break;
      case 'eraser':
        canvas.defaultCursor = 'crosshair';
        setupEraser(canvas);
        break;
      case 'text':
        canvas.defaultCursor = 'text';
        setupTextTool(canvas);
        break;
      case 'line':
      case 'rectangle':
      case 'rounded-rect':
      case 'circle':
      case 'ellipse':
      case 'triangle':
      case 'arrow':
        canvas.defaultCursor = 'crosshair';
        setupShapeDrawing(canvas, settings.tool);
        break;
      case 'fill':
        canvas.defaultCursor = 'crosshair';
        setupFillTool(canvas);
        break;
      case 'spray':
        canvas.defaultCursor = 'crosshair';
        setupSprayPaint(canvas);
        break;
      default:
        canvas.defaultCursor = 'default';
    }
  }, [settings.tool, settings, isDrawingMode]);

  // Setup freehand drawing with shape recognition
  const setupFreehandDrawing = (canvas: Canvas) => {
    console.log('[DrawingCanvas] setupFreehandDrawing called');

    canvas.on('mouse:down', (options) => {
      // Try multiple ways to get the pointer position for Fabric v6 compatibility
      const pointer = options.scenePoint || options.viewportPoint || options.absolutePointer ||
                     (options.e && canvas.getViewportPoint(options.e as MouseEvent));

      console.log('[DrawingCanvas] mouse:down event fired', {
        scenePoint: options.scenePoint,
        viewportPoint: options.viewportPoint,
        absolutePointer: options.absolutePointer,
        finalPointer: pointer
      });

      if (!pointer) {
        console.log('[DrawingCanvas] no pointer available in mouse:down');
        return;
      }
      isDrawingRef.current = true;
      drawingPathRef.current = [{ x: pointer.x, y: pointer.y }];
      console.log('[DrawingCanvas] drawing started at', drawingPathRef.current[0]);
    });

    canvas.on('mouse:move', (options) => {
      if (!isDrawingRef.current) return;

      const pointer = options.scenePoint || options.viewportPoint || options.absolutePointer ||
                     (options.e && canvas.getViewportPoint(options.e as MouseEvent));

      if (!pointer) {
        console.log('[DrawingCanvas] no pointer in mouse:move');
        return;
      }

      drawingPathRef.current.push({ x: pointer.x, y: pointer.y });

      // Draw temporary path
      if (currentPathRef.current) {
        canvas.remove(currentPathRef.current);
      }

      const pathString = drawingPathRef.current
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
        .join(' ');

      currentPathRef.current = new Path(pathString, {
        stroke: settings.strokeColor,
        strokeWidth: settings.strokeWidth,
        fill: '',
        selectable: false,
      });

      canvas.add(currentPathRef.current);
      canvas.renderAll();
    });

    canvas.on('mouse:up', () => {
      try {
        console.log('[DrawingCanvas] mouse:up event fired, isDrawing:', isDrawingRef.current, 'pathLength:', drawingPathRef.current.length);
        if (!isDrawingRef.current) return;
        isDrawingRef.current = false;

        console.log('[DrawingCanvas] After isDrawing check, removing temp path');

        // Remove temporary path
        if (currentPathRef.current) {
          console.log('[DrawingCanvas] Removing current path ref');
          canvas.remove(currentPathRef.current);
          currentPathRef.current = null;
        }

        console.log('[DrawingCanvas] About to process points, pathLength:', drawingPathRef.current.length);

        // Recognize shape
        const points = drawingPathRef.current;
        console.log('[DrawingCanvas] Processing drawn points:', points.length);
        
        if (points.length > 3) {
          // For pencil and brush, skip shape recognition - keep as freehand
          if (settings.tool === 'pencil' || settings.tool === 'brush') {
            console.log('[DrawingCanvas] Pencil/Brush tool - skipping shape recognition, keeping as freehand');
            const pathString = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

            const path = new Path(pathString, {
              stroke: settings.strokeColor,
              strokeWidth: settings.strokeWidth,
              fill: '',
              opacity: settings.opacity,
              selectable: true,
              evented: true,
              strokeLineCap: 'round',
              strokeLineJoin: 'round',
            });

            canvas.add(path);
            addShapeToList(path, 'path');
            canvas.renderAll();
            console.log('[DrawingCanvas] Freehand path added');
          } else {
            // For other tools, attempt shape recognition
            const recognition = ShapeRecognizer.recognize(points);
            console.log('[DrawingCanvas] Shape recognition result:', recognition);

            // Accept any recognized shape (confidence >= 0) if it's not unknown
            if (recognition.type !== 'unknown') {
              console.log('[DrawingCanvas] Creating recognized shape:', recognition.type, 'with confidence:', recognition.confidence);
              // Create perfect shape
              createRecognizedShape(canvas, recognition);
            } else {
              console.log('[DrawingCanvas] Keeping as freehand path, type is unknown');
              // Keep as freehand path
              const pathString = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

              console.log('[DrawingCanvas] Creating path with settings:', {
                pathString: pathString.substring(0, 100),
                stroke: settings.strokeColor,
                strokeWidth: settings.strokeWidth,
                fill: settings.fillColor,
                opacity: settings.opacity
              });

              const path = new Path(pathString, {
                stroke: settings.strokeColor,
                strokeWidth: settings.strokeWidth,
                fill: '',
                opacity: settings.opacity,
                selectable: true,
                evented: true,
                strokeLineCap: 'round',
                strokeLineJoin: 'round',
              });

              console.log('[DrawingCanvas] Path created:', {
                stroke: path.stroke,
                strokeWidth: path.strokeWidth,
                left: path.left,
                top: path.top,
                width: path.width,
                height: path.height
              });

              canvas.add(path);
              addShapeToList(path, 'path');
              canvas.renderAll();
              console.log('[DrawingCanvas] Path added and canvas rendered, total objects:', canvas.getObjects().length);
            }
          }
        } else {
          console.log('[DrawingCanvas] Path too short, not adding');
        }

        drawingPathRef.current = [];
        canvas.renderAll();
      } catch (error) {
        console.error('[DrawingCanvas] Error in mouse:up handler:', error);
      }
    });
  };

  // Create perfect shape from recognition result
  const createRecognizedShape = (canvas: Canvas, recognition: any) => {
    let shape: FabricObject | null = null;

    console.log('[DrawingCanvas] createRecognizedShape called with type:', recognition.type, 'bounds:', recognition.bounds);

    switch (recognition.type) {
      case 'line':
        if (recognition.points && recognition.points.length >= 2) {
          console.log('[DrawingCanvas] Creating line from', recognition.points[0], 'to', recognition.points[1]);
          shape = new Line(
            [
              recognition.points[0].x,
              recognition.points[0].y,
              recognition.points[1].x,
              recognition.points[1].y,
            ],
            {
              stroke: settings.strokeColor,
              strokeWidth: settings.strokeWidth,
              opacity: settings.opacity,
              selectable: true,
              evented: true,
              strokeLineCap: 'round',
            }
          );
          console.log('[DrawingCanvas] Line created:', {
            stroke: shape.stroke,
            strokeWidth: shape.strokeWidth,
          });
        }
        break;

      case 'circle':
        shape = new Circle({
          left: recognition.bounds.x,
          top: recognition.bounds.y,
          radius: recognition.bounds.width / 2,
          stroke: settings.strokeColor,
          strokeWidth: settings.strokeWidth,
          fill: settings.fillColor === 'transparent' ? '' : settings.fillColor,
          opacity: settings.opacity,
        });
        break;

      case 'square':
      case 'rectangle':
        shape = new Rect({
          left: recognition.bounds.x,
          top: recognition.bounds.y,
          width: recognition.bounds.width,
          height: recognition.bounds.height,
          stroke: settings.strokeColor,
          strokeWidth: settings.strokeWidth,
          fill: settings.fillColor === 'transparent' ? '' : settings.fillColor,
          opacity: settings.opacity,
        });
        break;

      case 'triangle':
        if (recognition.points && recognition.points.length >= 3) {
          shape = new Triangle({
            left: recognition.bounds.x,
            top: recognition.bounds.y,
            width: recognition.bounds.width,
            height: recognition.bounds.height,
            stroke: settings.strokeColor,
            strokeWidth: settings.strokeWidth,
            fill: settings.fillColor === 'transparent' ? '' : settings.fillColor,
            opacity: settings.opacity,
          });
        }
        break;

      case 'polygon':
        // For polygons, create a path from the points
        console.log('[DrawingCanvas] Polygon case - recognition.points:', recognition.points?.length);
        if (recognition.points && recognition.points.length >= 3) {
          const pathString = recognition.points
            .map((p: any, i: number) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
            .join(' ') + ' Z'; // Close the path
          
          console.log('[DrawingCanvas] Creating polygon path:', pathString.substring(0, 100));
          
          shape = new Path(pathString, {
            stroke: settings.strokeColor,
            strokeWidth: settings.strokeWidth,
            fill: settings.fillColor === 'transparent' ? '' : settings.fillColor,
            opacity: settings.opacity,
            selectable: true,
            evented: true,
            strokeLineCap: 'round',
            strokeLineJoin: 'round',
          });
          console.log('[DrawingCanvas] Polygon path created:', shape);
        } else {
          console.log('[DrawingCanvas] Polygon has no points or less than 3 points');
        }
        break;

      default:
        console.log('[DrawingCanvas] Unknown shape type:', recognition.type);
    }

    if (shape) {
      console.log('[DrawingCanvas] Adding shape to canvas:', recognition.type);
      canvas.add(shape);
      addShapeToList(shape, recognition.type);
      canvas.renderAll();
      console.log('[DrawingCanvas] Shape added and rendered');
    } else {
      console.log('[DrawingCanvas] No shape created for type:', recognition.type);
    }
  };

  // Setup direct shape drawing (click and drag)
  const setupShapeDrawing = (canvas: Canvas, shapeType: string) => {
    canvas.on('mouse:down', (options) => {
      const pointer = options.scenePoint || options.viewportPoint || options.absolutePointer ||
                     (options.e && canvas.getViewportPoint(options.e as MouseEvent));
      if (!pointer) return;
      startPointRef.current = { x: pointer.x, y: pointer.y };
    });

    canvas.on('mouse:move', (options) => {
      if (!startPointRef.current) return;
      const pointer = options.scenePoint || options.viewportPoint || options.absolutePointer ||
                     (options.e && canvas.getViewportPoint(options.e as MouseEvent));
      if (!pointer) return;

      if (currentShapeRef.current) {
        canvas.remove(currentShapeRef.current);
      }

      const startPoint = startPointRef.current;
      const width = pointer.x - startPoint.x;
      const height = pointer.y - startPoint.y;

      switch (shapeType) {
        case 'rectangle':
        case 'rounded-rect':
          currentShapeRef.current = new Rect({
            left: startPoint.x,
            top: startPoint.y,
            width: width,
            height: height,
            stroke: settings.strokeColor,
            strokeWidth: settings.strokeWidth,
            fill: settings.fillColor === 'transparent' ? '' : settings.fillColor,
            opacity: settings.opacity,
            rx: shapeType === 'rounded-rect' ? 10 : 0,
            ry: shapeType === 'rounded-rect' ? 10 : 0,
            selectable: false,
          });
          break;

        case 'circle':
          const radius = Math.sqrt(width * width + height * height) / 2;
          currentShapeRef.current = new Circle({
            left: startPoint.x,
            top: startPoint.y,
            radius: radius,
            stroke: settings.strokeColor,
            strokeWidth: settings.strokeWidth,
            fill: settings.fillColor === 'transparent' ? '' : settings.fillColor,
            opacity: settings.opacity,
            selectable: false,
          });
          break;

        case 'ellipse':
          currentShapeRef.current = new Ellipse({
            left: startPoint.x,
            top: startPoint.y,
            rx: Math.abs(width / 2),
            ry: Math.abs(height / 2),
            stroke: settings.strokeColor,
            strokeWidth: settings.strokeWidth,
            fill: settings.fillColor === 'transparent' ? '' : settings.fillColor,
            opacity: settings.opacity,
            selectable: false,
          });
          break;

        case 'line':
          currentShapeRef.current = new Line([startPoint.x, startPoint.y, pointer.x, pointer.y], {
            stroke: settings.strokeColor,
            strokeWidth: settings.strokeWidth,
            opacity: settings.opacity,
            selectable: false,
          });
          break;

        case 'triangle':
          currentShapeRef.current = new Triangle({
            left: startPoint.x,
            top: startPoint.y,
            width: Math.abs(width),
            height: Math.abs(height),
            stroke: settings.strokeColor,
            strokeWidth: settings.strokeWidth,
            fill: settings.fillColor === 'transparent' ? '' : settings.fillColor,
            opacity: settings.opacity,
            selectable: false,
          });
          break;

        case 'arrow':
          currentShapeRef.current = new Line([startPoint.x, startPoint.y, pointer.x, pointer.y], {
            stroke: settings.strokeColor,
            strokeWidth: settings.strokeWidth,
            opacity: settings.opacity,
            selectable: false,
          });
          break;
      }

      if (currentShapeRef.current) {
        canvas.add(currentShapeRef.current);
        canvas.renderAll();
      }
    });

    canvas.on('mouse:up', () => {
      if (currentShapeRef.current) {
        currentShapeRef.current.set({ selectable: true });
        addShapeToList(currentShapeRef.current, shapeType);
        currentShapeRef.current = null;
      }
      startPointRef.current = null;
    });
  };

  // Setup text tool
  const setupTextTool = (canvas: Canvas) => {
    canvas.on('mouse:down', (options) => {
      const pointer = options.scenePoint || options.viewportPoint || options.absolutePointer ||
                     (options.e && canvas.getViewportPoint(options.e as MouseEvent));
      if (!pointer) return;

      const text = new IText('Text', {
        left: pointer.x,
        top: pointer.y,
        fontSize: settings.fontSize || 20,
        fontFamily: settings.fontFamily || 'Arial',
        fill: settings.strokeColor,
      });

      canvas.add(text);
      canvas.setActiveObject(text);
      text.enterEditing();
      canvas.renderAll();

      addShapeToList(text, 'text');
    });
  };

  // Setup eraser
  const setupEraser = (canvas: Canvas) => {
    canvas.on('mouse:down', (options) => {
      const target = options.target as FabricObject;
      if (target) {
        canvas.remove(target);
        setDrawnShapes((prev) => prev.filter((s) => s.fabricObject !== target));
      }
    });
  };

  // Setup fill tool
  const setupFillTool = (canvas: Canvas) => {
    canvas.on('mouse:down', (options) => {
      const target = options.target as FabricObject;
      if (target) {
        target.set('fill', settings.fillColor);
        canvas.renderAll();
      }
    });
  };

  // Setup spray paint
  const setupSprayPaint = (canvas: Canvas) => {
    let spraying = false;

    canvas.on('mouse:down', (options) => {
      const pointer = options.scenePoint || options.viewportPoint || options.absolutePointer ||
                     (options.e && canvas.getViewportPoint(options.e as MouseEvent));
      if (!pointer) return;
      spraying = true;
      sprayAtPoint(canvas, pointer.x, pointer.y);
    });

    canvas.on('mouse:move', (options) => {
      if (!spraying) return;
      const pointer = options.scenePoint || options.viewportPoint || options.absolutePointer ||
                     (options.e && canvas.getViewportPoint(options.e as MouseEvent));
      if (pointer) {
        sprayAtPoint(canvas, pointer.x, pointer.y);
      }
    });

    canvas.on('mouse:up', () => {
      spraying = false;
    });
  };

  const sprayAtPoint = (canvas: Canvas, x: number, y: number) => {
    const density = 10;
    const radius = settings.brushSize || 20;

    for (let i = 0; i < density; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * radius;
      const px = x + Math.cos(angle) * distance;
      const py = y + Math.sin(angle) * distance;

      const dot = new Circle({
        left: px,
        top: py,
        radius: settings.strokeWidth / 2,
        fill: settings.strokeColor,
        selectable: false,
      });

      canvas.add(dot);
    }

    canvas.renderAll();
  };

  // Setup select mode (for connections)
  const setupSelectMode = (canvas: Canvas) => {
    console.log('[DrawingCanvas] Select mode enabled for connections');

    canvas.on('mouse:down', (options) => {
      const target = options.target as FabricObject;
      if (target) {
        const shape = drawnShapes.find((s) => s.fabricObject === target);
        if (shape) {
          if (connectingFromRef.current === null) {
            // Start connection - highlight the shape
            target.set({
              strokeWidth: (target.strokeWidth || 2) + 2,
              stroke: '#0078d7',
            });
            canvas.renderAll();
            connectingFromRef.current = shape;
            console.log('✓ Connection started from shape:', shape.id, '- Click another shape to connect');
          } else if (connectingFromRef.current !== shape) {
            // Complete connection
            createConnection(canvas, connectingFromRef.current, shape);

            // Reset the first shape's appearance
            const fromObj = connectingFromRef.current.fabricObject;
            fromObj.set({
              strokeWidth: (fromObj.strokeWidth || 2) - 2,
              stroke: settings.strokeColor,
            });
            canvas.renderAll();

            connectingFromRef.current = null;
            console.log('✓ Connection completed!');
          } else {
            // Clicked same shape - cancel
            target.set({
              strokeWidth: (target.strokeWidth || 2) - 2,
              stroke: settings.strokeColor,
            });
            canvas.renderAll();
            connectingFromRef.current = null;
            console.log('Connection cancelled');
          }
        }
      }
    });
  };

  // Calculate center point of a shape
  const getShapeCenter = (obj: FabricObject): { x: number; y: number } => {
    const left = obj.left || 0;
    const top = obj.top || 0;
    const width = (obj.width || 0) * (obj.scaleX || 1);
    const height = (obj.height || 0) * (obj.scaleY || 1);

    return {
      x: left + width / 2,
      y: top + height / 2,
    };
  };

  // Create connection between shapes
  const createConnection = (canvas: Canvas, from: DrawnShape, to: DrawnShape) => {
    const fromObj = from.fabricObject;
    const toObj = to.fabricObject;

    // Calculate connection points (center of shapes)
    const fromPoint = getShapeCenter(fromObj);
    const toPoint = getShapeCenter(toObj);

    console.log('[DrawingCanvas] Creating connection from', fromPoint, 'to', toPoint);

    // Create arrow line with bigger stroke
    const line = new Line([fromPoint.x, fromPoint.y, toPoint.x, toPoint.y], {
      stroke: '#0078d7',
      strokeWidth: 3,
      selectable: false,
      evented: false,
      strokeDashArray: [5, 5], // Dashed line for visibility
    });

    canvas.add(line);
    canvas.sendObjectToBack(line);

    // Add connection points (small circles) at endpoints
    const startDot = new Circle({
      left: fromPoint.x - 4,
      top: fromPoint.y - 4,
      radius: 4,
      fill: '#0078d7',
      selectable: false,
      evented: false,
    });

    const endDot = new Circle({
      left: toPoint.x - 4,
      top: toPoint.y - 4,
      radius: 4,
      fill: '#0078d7',
      selectable: false,
      evented: false,
    });

    canvas.add(startDot, endDot);
    canvas.renderAll();

    // Save connection
    const connection: ShapeConnection = {
      id: `conn_${Date.now()}`,
      from: from.id,
      to: to.id,
      fromPoint,
      toPoint,
      fabricLine: line,
    };

    connectionsRef.current = [...connectionsRef.current, connection];

    // Update shapes
    setDrawnShapes((prev) =>
      prev.map((s) => {
        if (s.id === from.id) {
          return { ...s, connections: [...s.connections, to.id] };
        }
        if (s.id === to.id) {
          return { ...s, connections: [...s.connections, from.id] };
        }
        return s;
      })
    );

    console.log('Connection created:', connection);
  };

  // Add shape to list and enable labeling
  const addShapeToList = (fabricObject: FabricObject, type: string) => {
    console.log('[DrawingCanvas] addShapeToList called with type:', type);
    
    const id = `shape_${Date.now()}_${Math.random()}`;

    const shape: DrawnShape = {
      id,
      type,
      fabricObject,
      connections: [],
    };

    console.log('[DrawingCanvas] Adding shape to state:', shape);
    setDrawnShapes((prev) => [...prev, shape]);

    // Add double-click listener to add label
    fabricObject.on('mousedblclick', () => {
      const label = prompt('Enter a name for this shape:');
      if (label) {
        addLabelToShape(fabricCanvasRef.current!, shape, label);
      }
    });
  };

  // Add text label inside shape
  const addLabelToShape = (canvas: Canvas, shape: DrawnShape, label: string) => {
    const obj = shape.fabricObject;
    const centerX = (obj.left || 0) + ((obj.width || 0) * (obj.scaleX || 1)) / 2;
    const centerY = (obj.top || 0) + ((obj.height || 0) * (obj.scaleY || 1)) / 2;

    const text = new IText(label, {
      left: centerX,
      top: centerY,
      fontSize: 14,
      fill: '#000000',
      fontFamily: 'Arial',
      originX: 'center',
      originY: 'center',
      selectable: false,
      evented: false,
    });

    canvas.add(text);
    canvas.renderAll();

    // Update shape with label
    setDrawnShapes((prev) =>
      prev.map((s) => (s.id === shape.id ? { ...s, label } : s))
    );
  };

  return (
    <>
      {isDrawingMode && (
        <div
          style={{
            position: 'fixed',
            top: '130px',
            left: '0',
            right: '0',
            bottom: '0',
            backgroundColor: '#ffffff',
            zIndex: 100,
            overflow: 'hidden',
          }}
        >
          <canvas
            ref={canvasRef}
            style={{
              display: 'block',
              width: '100%',
              height: '100%',
            }}
          />
        </div>
      )}
    </>
  );
}
