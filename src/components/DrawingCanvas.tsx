import { useCallback, useRef, useState, useEffect } from 'react';
import { Point, DrawnShape, DrawingTool } from '../types/drawing';
import { shapeRecognizer } from '../utils/shapeRecognition';

interface DrawingCanvasProps {
  onShapeComplete: (shape: DrawnShape) => void;
  currentTool: DrawingTool | null;
}

export function DrawingCanvas({ onShapeComplete, currentTool }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [rawPoints, setRawPoints] = useState<Point[]>([]);

  const drawPoints = useCallback((points: Point[], ctx: CanvasRenderingContext2D) => {
    if (points.length < 1) return;

    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (points.length === 1) {
      // Draw a single point as a small circle
      ctx.beginPath();
      ctx.arc(points[0].x, points[0].y, 2, 0, 2 * Math.PI);
      ctx.fillStyle = '#ef4444';
      ctx.fill();
      return;
    }

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    
    ctx.stroke();
  }, []);

  const drawPerfectShape = useCallback((points: Point[], ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = '#10b981';
    ctx.fillStyle = 'rgba(16, 185, 129, 0.1)';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    
    ctx.stroke();
    ctx.fill();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateSize = () => {
      if (overlayRef.current && overlayRef.current.parentElement) {
        const parent = overlayRef.current.parentElement;
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      } else {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
      
      // Re-draw if we have points
      if (rawPoints.length > 0) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          drawPoints(rawPoints, ctx);
        }
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    return () => window.removeEventListener('resize', updateSize);
  }, [rawPoints, drawPoints]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!currentTool) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = overlayRef.current?.getBoundingClientRect();
    if (!rect) return;

    const pos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    
    setIsDrawing(true);
    setRawPoints([pos]);
    
    // Draw the initial point
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPoints([pos], ctx);
  }, [currentTool, drawPoints]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !currentTool) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = overlayRef.current?.getBoundingClientRect();
    if (!rect) return;

    const pos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    
    const newPoints = [...rawPoints, pos];
    setRawPoints(newPoints);
    
    // Clear and redraw
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPoints(newPoints, ctx);
  }, [isDrawing, currentTool, rawPoints, drawPoints]);

  const handleMouseUp = useCallback(() => {
    if (!isDrawing || !currentTool || rawPoints.length < 3) {
      setIsDrawing(false);
      setRawPoints([]);
      return;
    }

    setIsDrawing(false);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Recognize the shape
    const analysis = shapeRecognizer.recognizeShape(rawPoints);
    
    if (analysis.type !== 'unknown' && analysis.confidence > 0.6) {
      // Clear and draw the perfect shape
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawPerfectShape(analysis.points, ctx);

      // Show a brief success indicator
      setTimeout(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Prompt for label
        const label = prompt(`Enter a label for this ${analysis.type}:`, analysis.type.charAt(0).toUpperCase() + analysis.type.slice(1));
        
        if (label && label.trim()) {
          const shape: DrawnShape = {
            id: `shape_${Date.now()}`,
            type: analysis.type as any,
            points: analysis.points,
            bounds: analysis.bounds,
            label: label.trim(),
            recognized: true,
          };

          onShapeComplete(shape);
        }
      }, 500);
    } else {
      // Clear canvas if shape not recognized
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      alert('Shape not recognized. Please try drawing more clearly: rectangle, circle, triangle, or line.');
    }

    setRawPoints([]);
  }, [isDrawing, currentTool, rawPoints, drawPerfectShape, onShapeComplete]);

  if (!currentTool) {
    return null;
  }

  return (
    <div
      ref={overlayRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        cursor: 'crosshair',
        pointerEvents: 'auto',
        zIndex: 2000,
        backgroundColor: 'transparent',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 2001,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'white',
          padding: '12px 24px',
          borderRadius: '30px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          zIndex: 2002,
        }}
      >
        <div style={{ 
          width: '12px', 
          height: '12px', 
          borderRadius: '50%', 
          backgroundColor: '#ef4444',
          boxShadow: '0 0 0 2px rgba(239, 68, 68, 0.2)'
        }} />
        <div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
            {currentTool === 'freehand' ? 'Freehand Drawing' : `Drawing ${currentTool.charAt(0).toUpperCase() + currentTool.slice(1)}`}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            Draw on the whiteboard • Release to finish
          </div>
        </div>
      </div>
    </div>
  );
}
