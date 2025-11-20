export type DrawingTool = 
  | 'rectangle'
  | 'circle'
  | 'triangle'
  | 'line'
  | 'arrow'
  | 'freehand';

export interface Point {
  x: number;
  y: number;
}

export interface DrawnShape {
  id: string;
  type: 'rectangle' | 'circle' | 'triangle' | 'line' | 'arrow';
  points: Point[];
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  label: string;
  recognized: boolean;
}

export interface DrawingState {
  isDrawing: boolean;
  currentTool: DrawingTool;
  rawPoints: Point[];
  shapes: DrawnShape[];
}
