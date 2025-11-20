import { Point, DrawnShape } from '../types/drawing';

interface ShapeAnalysis {
  type: 'rectangle' | 'circle' | 'triangle' | 'line' | 'arrow' | 'unknown';
  confidence: number;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  points: Point[];
}

export class ShapeRecognizer {
  private readonly LINE_THRESHOLD = 0.15; // Straightness threshold
  private readonly MIN_POINTS = 5; // Minimum points needed

  recognizeShape(rawPoints: Point[]): ShapeAnalysis {
    if (rawPoints.length < this.MIN_POINTS) {
      return this.createUnknownShape(rawPoints);
    }

    // Simplify the points first
    const simplified = this.simplifyPoints(rawPoints);
    const bounds = this.calculateBounds(simplified);

    // Try to recognize different shapes
    const lineScore = this.isLine(simplified, bounds);
    const circleScore = this.isCircle(simplified, bounds);
    const rectangleScore = this.isRectangle(simplified, bounds);
    const triangleScore = this.isTriangle(simplified);

    // Find the best match
    const scores = [
      { type: 'line' as const, score: lineScore },
      { type: 'circle' as const, score: circleScore },
      { type: 'rectangle' as const, score: rectangleScore },
      { type: 'triangle' as const, score: triangleScore },
    ];

    const best = scores.reduce((a, b) => (a.score > b.score ? a : b));

    if (best.score > 0.6) {
      return {
        type: best.type,
        confidence: best.score,
        bounds,
        points: this.generatePerfectShape(best.type, bounds),
      };
    }

    return this.createUnknownShape(rawPoints);
  }

  private simplifyPoints(points: Point[], tolerance = 5): Point[] {
    if (points.length < 3) return points;

    // Douglas-Peucker algorithm
    let maxDistance = 0;
    let maxIndex = 0;

    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];

    for (let i = 1; i < points.length - 1; i++) {
      const distance = this.perpendicularDistance(points[i], firstPoint, lastPoint);
      if (distance > maxDistance) {
        maxDistance = distance;
        maxIndex = i;
      }
    }

    if (maxDistance > tolerance) {
      const left = this.simplifyPoints(points.slice(0, maxIndex + 1), tolerance);
      const right = this.simplifyPoints(points.slice(maxIndex), tolerance);
      return [...left.slice(0, -1), ...right];
    }

    return [firstPoint, lastPoint];
  }

  private perpendicularDistance(point: Point, lineStart: Point, lineEnd: Point): number {
    const dx = lineEnd.x - lineStart.x;
    const dy = lineEnd.y - lineStart.y;
    const norm = Math.sqrt(dx * dx + dy * dy);

    if (norm === 0) return this.distance(point, lineStart);

    return Math.abs((point.x - lineStart.x) * dy - (point.y - lineStart.y) * dx) / norm;
  }

  private distance(p1: Point, p2: Point): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private calculateBounds(points: Point[]) {
    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }

  private isLine(points: Point[], bounds: { width: number; height: number }): number {
    if (points.length < 2) return 0;

    const aspectRatio = Math.min(bounds.width, bounds.height) / Math.max(bounds.width, bounds.height);
    
    if (aspectRatio > this.LINE_THRESHOLD) return 0;

    // Check if points are roughly collinear
    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];
    let totalDeviation = 0;

    for (const point of points) {
      totalDeviation += this.perpendicularDistance(point, firstPoint, lastPoint);
    }

    const avgDeviation = totalDeviation / points.length;
    const lineLength = this.distance(firstPoint, lastPoint);
    const deviationRatio = avgDeviation / lineLength;

    return Math.max(0, 1 - deviationRatio * 10);
  }

  private isCircle(points: Point[], bounds: { x: number; y: number; width: number; height: number }): number {
    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y + bounds.height / 2;
    const avgRadius = (bounds.width + bounds.height) / 4;

    // Check if the shape is roughly circular
    const aspectRatio = Math.min(bounds.width, bounds.height) / Math.max(bounds.width, bounds.height);
    if (aspectRatio < 0.7) return 0;

    let totalDeviation = 0;
    for (const point of points) {
      const radius = this.distance(point, { x: centerX, y: centerY });
      totalDeviation += Math.abs(radius - avgRadius);
    }

    const avgDeviation = totalDeviation / points.length;
    const deviationRatio = avgDeviation / avgRadius;

    return Math.max(0, 1 - deviationRatio * 4);
  }

  private isRectangle(points: Point[], bounds: { width: number; height: number }): number {
    if (points.length < 4) return 0;

    // Check if it's roughly rectangular in shape
    const aspectRatio = Math.min(bounds.width, bounds.height) / Math.max(bounds.width, bounds.height);
    
    // Simplified check: look for 4 corners roughly at right angles
    const simplified = this.simplifyPoints(points, 10);
    
    if (simplified.length < 4 || simplified.length > 6) return 0.3;

    // Check if first and last points are close (closed shape)
    const closedDistance = this.distance(simplified[0], simplified[simplified.length - 1]);
    const perimeter = this.calculatePerimeter(simplified);
    const closedRatio = closedDistance / perimeter;

    if (closedRatio > 0.15) return 0;

    return 0.7 + (1 - aspectRatio) * 0.3;
  }

  private isTriangle(points: Point[]): number {
    const simplified = this.simplifyPoints(points, 10);
    
    if (simplified.length < 3 || simplified.length > 5) return 0.2;

    // Check if first and last points are close (closed shape)
    const closedDistance = this.distance(simplified[0], simplified[simplified.length - 1]);
    const perimeter = this.calculatePerimeter(simplified);
    const closedRatio = closedDistance / perimeter;

    if (closedRatio > 0.15) return 0;

    // Three sides should be roughly equal to perimeter / 3
    if (simplified.length === 3 || simplified.length === 4) {
      return 0.75;
    }

    return 0.4;
  }

  private calculatePerimeter(points: Point[]): number {
    let perimeter = 0;
    for (let i = 0; i < points.length - 1; i++) {
      perimeter += this.distance(points[i], points[i + 1]);
    }
    return perimeter;
  }

  private generatePerfectShape(type: string, bounds: { x: number; y: number; width: number; height: number }): Point[] {
    const { x, y, width, height } = bounds;
    const centerX = x + width / 2;
    const centerY = y + height / 2;

    switch (type) {
      case 'line':
        return [
          { x, y: centerY },
          { x: x + width, y: centerY },
        ];

      case 'circle': {
        const radius = Math.max(width, height) / 2;
        const points: Point[] = [];
        for (let i = 0; i <= 32; i++) {
          const angle = (i / 32) * 2 * Math.PI;
          points.push({
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle),
          });
        }
        return points;
      }

      case 'rectangle':
        return [
          { x, y },
          { x: x + width, y },
          { x: x + width, y: y + height },
          { x, y: y + height },
          { x, y },
        ];

      case 'triangle':
        return [
          { x: centerX, y },
          { x: x + width, y: y + height },
          { x, y: y + height },
          { x: centerX, y },
        ];

      default:
        return [];
    }
  }

  private createUnknownShape(points: Point[]): ShapeAnalysis {
    const bounds = this.calculateBounds(points);
    return {
      type: 'unknown',
      confidence: 0,
      bounds,
      points,
    };
  }

  convertShapeToNode(shape: DrawnShape, label: string) {
    return {
      id: shape.id,
      type: 'custom',
      position: {
        x: shape.bounds.x,
        y: shape.bounds.y,
      },
      data: {
        label,
        component: {
          id: shape.type,
          label,
          category: 'Drawing',
          icon: this.getIconForShape(shape.type),
          description: `Hand-drawn ${shape.type}`,
        },
      },
    };
  }

  private getIconForShape(type: string): string {
    const icons: { [key: string]: string } = {
      rectangle: '▢',
      circle: '○',
      triangle: '△',
      line: '—',
      arrow: '→',
    };
    return icons[type] || '◇';
  }
}

export const shapeRecognizer = new ShapeRecognizer();
