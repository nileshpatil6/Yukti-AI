// Drawing tool types for the Paint-like interface

export type DrawingTool =
  | 'select'
  | 'pencil'
  | 'brush'
  | 'eraser'
  | 'fill'
  | 'text'
  | 'line'
  | 'rectangle'
  | 'circle'
  | 'triangle'
  | 'polygon'
  | 'ellipse'
  | 'rounded-rect'
  | 'arrow'
  | 'curve'
  | 'spray'
  | 'eyedropper';

export interface DrawingSettings {
  tool: DrawingTool;
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  brushSize: number;
  fontSize: number;
  fontFamily: string;
  opacity: number;
}

export interface ShapeRecognitionResult {
  type: 'circle' | 'rectangle' | 'square' | 'triangle' | 'line' | 'ellipse' | 'polygon' | 'unknown';
  confidence: number;
  bounds: { x: number; y: number; width: number; height: number };
  points?: { x: number; y: number }[];
}

export interface DrawnShape {
  id: string;
  type: string;
  fabricObject: any; // Fabric.js object
  label?: string;
  connections: string[]; // IDs of connected shapes
}

export interface ShapeConnection {
  id: string;
  from: string;
  to: string;
  fromPoint: { x: number; y: number };
  toPoint: { x: number; y: number };
  fabricLine: any; // Fabric.js line object
}
