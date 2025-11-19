// Shape recognition algorithm for auto-correcting freehand drawings
import { ShapeRecognitionResult } from '../types/drawing';

interface Point {
  x: number;
  y: number;
}

/**
 * Recognizes shapes from freehand drawing points
 */
export class ShapeRecognizer {
  private static readonly CIRCLE_THRESHOLD = 0.65;
  private static readonly LINE_THRESHOLD = 0.75;
  private static readonly RECTANGLE_THRESHOLD = 0.60;
  private static readonly TRIANGLE_THRESHOLD = 0.65;

  /**
   * Main recognition function
   */
  static recognize(points: Point[]): ShapeRecognitionResult {
    if (points.length < 3) {
      return {
        type: 'unknown',
        confidence: 0,
        bounds: this.getBounds(points),
      };
    }

    // Try to recognize different shapes in order of complexity
    const lineResult = this.recognizeLine(points);
    console.log('[ShapeRecognizer] Line result:', { confidence: lineResult.confidence, threshold: this.LINE_THRESHOLD });
    if (lineResult.confidence > this.LINE_THRESHOLD) {
      console.log('[ShapeRecognizer] Recognized as LINE with confidence:', lineResult.confidence);
      return lineResult;
    }

    const circleResult = this.recognizeCircle(points);
    console.log('[ShapeRecognizer] Circle result:', { confidence: circleResult.confidence, threshold: this.CIRCLE_THRESHOLD });
    if (circleResult.confidence > this.CIRCLE_THRESHOLD) {
      console.log('[ShapeRecognizer] Recognized as CIRCLE with confidence:', circleResult.confidence);
      return circleResult;
    }

    const rectangleResult = this.recognizeRectangle(points);
    console.log('[ShapeRecognizer] Rectangle result:', { confidence: rectangleResult.confidence, threshold: this.RECTANGLE_THRESHOLD });
    if (rectangleResult.confidence > this.RECTANGLE_THRESHOLD) {
      console.log('[ShapeRecognizer] Recognized as RECTANGLE with confidence:', rectangleResult.confidence);
      return rectangleResult;
    }

    const triangleResult = this.recognizeTriangle(points);
    console.log('[ShapeRecognizer] Triangle result:', { confidence: triangleResult.confidence, threshold: this.TRIANGLE_THRESHOLD });
    if (triangleResult.confidence > this.TRIANGLE_THRESHOLD) {
      console.log('[ShapeRecognizer] Recognized as TRIANGLE with confidence:', triangleResult.confidence);
      return triangleResult;
    }

    console.log('[ShapeRecognizer] No shape recognized, returning unknown');
    return {
      type: 'unknown',
      confidence: 0,
      bounds: this.getBounds(points),
      points,
    };
  }

  /**
   * Recognize if points form a straight line
   */
  private static recognizeLine(points: Point[]): ShapeRecognitionResult {
    if (points.length < 2) {
      return { type: 'line', confidence: 0, bounds: this.getBounds(points) };
    }

    const start = points[0];
    const end = points[points.length - 1];

    // Calculate how far each point deviates from the ideal line
    let totalDeviation = 0;
    const lineLength = this.distance(start, end);

    if (lineLength < 5) {
      return { type: 'line', confidence: 0, bounds: this.getBounds(points) };
    }

    for (const point of points) {
      const deviation = this.pointToLineDistance(point, start, end);
      totalDeviation += deviation;
    }

    const avgDeviation = totalDeviation / points.length;
    const confidence = Math.max(0, 1 - (avgDeviation / lineLength) * 10);

    return {
      type: 'line',
      confidence,
      bounds: this.getBounds(points),
      points: [start, end],
    };
  }

  /**
   * Recognize if points form a circle
   */
  private static recognizeCircle(points: Point[]): ShapeRecognitionResult {
    if (points.length < 10) {
      return { type: 'circle', confidence: 0, bounds: this.getBounds(points) };
    }

    // Find center and average radius
    const bounds = this.getBounds(points);
    const center = {
      x: bounds.x + bounds.width / 2,
      y: bounds.y + bounds.height / 2,
    };

    // Calculate average distance from center
    let totalRadius = 0;
    for (const point of points) {
      totalRadius += this.distance(point, center);
    }
    const avgRadius = totalRadius / points.length;

    // Check if it's closed (start and end are close)
    const isClosed = this.distance(points[0], points[points.length - 1]) < avgRadius * 0.3;
    if (!isClosed) {
      return { type: 'circle', confidence: 0, bounds };
    }

    // Calculate variance in radius
    let radiusVariance = 0;
    for (const point of points) {
      const r = this.distance(point, center);
      radiusVariance += Math.abs(r - avgRadius);
    }
    radiusVariance /= points.length;

    // Check aspect ratio (should be close to 1 for circles)
    const aspectRatio = bounds.width / bounds.height;
    const aspectRatioScore = 1 - Math.abs(1 - aspectRatio);

    const confidence = Math.max(0, (1 - radiusVariance / avgRadius) * aspectRatioScore);

    return {
      type: 'circle',
      confidence,
      bounds: {
        x: center.x - avgRadius,
        y: center.y - avgRadius,
        width: avgRadius * 2,
        height: avgRadius * 2,
      },
    };
  }

  /**
   * Recognize if points form a rectangle or square
   */
  private static recognizeRectangle(points: Point[]): ShapeRecognitionResult {
    if (points.length < 10) {
      return { type: 'rectangle', confidence: 0, bounds: this.getBounds(points) };
    }

    // Check if closed
    const isClosed = this.distance(points[0], points[points.length - 1]) < 30;
    if (!isClosed) {
      return { type: 'rectangle', confidence: 0, bounds: this.getBounds(points) };
    }

    // Find corner candidates
    const corners = this.findCorners(points, 4);
    if (corners.length !== 4) {
      return { type: 'rectangle', confidence: 0, bounds: this.getBounds(points) };
    }

    // Check if corners form right angles
    const angles = this.getAngles(corners);
    let angleScore = 0;
    for (const angle of angles) {
      const deviation = Math.abs(angle - 90);
      angleScore += Math.max(0, 1 - deviation / 45);
    }
    angleScore /= angles.length;

    // Check if opposite sides are parallel and equal
    const sides = [
      this.distance(corners[0], corners[1]),
      this.distance(corners[1], corners[2]),
      this.distance(corners[2], corners[3]),
      this.distance(corners[3], corners[0]),
    ];

    const parallelScore =
      (1 - Math.abs(sides[0] - sides[2]) / Math.max(sides[0], sides[2])) * 0.5 +
      (1 - Math.abs(sides[1] - sides[3]) / Math.max(sides[1], sides[3])) * 0.5;

    const confidence = (angleScore * 0.6 + parallelScore * 0.4);

    // Determine if it's a square
    const aspectRatio = Math.max(sides[0], sides[2]) / Math.max(sides[1], sides[3]);
    const isSquare = Math.abs(aspectRatio - 1) < 0.15;

    return {
      type: isSquare ? 'square' : 'rectangle',
      confidence,
      bounds: this.getBounds(corners),
      points: corners,
    };
  }

  /**
   * Recognize if points form a triangle
   */
  private static recognizeTriangle(points: Point[]): ShapeRecognitionResult {
    if (points.length < 10) {
      return { type: 'triangle', confidence: 0, bounds: this.getBounds(points) };
    }

    // Check if closed
    const isClosed = this.distance(points[0], points[points.length - 1]) < 30;
    if (!isClosed) {
      return { type: 'triangle', confidence: 0, bounds: this.getBounds(points) };
    }

    // Find corner candidates
    const corners = this.findCorners(points, 3);
    if (corners.length !== 3) {
      return { type: 'triangle', confidence: 0, bounds: this.getBounds(points) };
    }

    // Check if points lie roughly on the triangle edges
    let deviation = 0;
    for (const point of points) {
      const d1 = this.pointToLineDistance(point, corners[0], corners[1]);
      const d2 = this.pointToLineDistance(point, corners[1], corners[2]);
      const d3 = this.pointToLineDistance(point, corners[2], corners[0]);
      deviation += Math.min(d1, d2, d3);
    }

    const avgDeviation = deviation / points.length;
    const perimeter =
      this.distance(corners[0], corners[1]) +
      this.distance(corners[1], corners[2]) +
      this.distance(corners[2], corners[0]);

    const confidence = Math.max(0, 1 - (avgDeviation / perimeter) * 20);

    return {
      type: 'triangle',
      confidence,
      bounds: this.getBounds(corners),
      points: corners,
    };
  }

  /**
   * Find corner points in the path
   */
  private static findCorners(points: Point[], expectedCorners: number): Point[] {
    if (points.length < expectedCorners) return [];

    const corners: Point[] = [points[0]];
    const segmentSize = Math.floor(points.length / expectedCorners);

    for (let i = 1; i < expectedCorners; i++) {
      const segment = points.slice(i * segmentSize - 5, i * segmentSize + 5);
      let maxCurvature = 0;
      let cornerPoint = segment[0];

      for (let j = 1; j < segment.length - 1; j++) {
        const curvature = this.getCurvature(
          segment[j - 1],
          segment[j],
          segment[j + 1]
        );
        if (curvature > maxCurvature) {
          maxCurvature = curvature;
          cornerPoint = segment[j];
        }
      }

      corners.push(cornerPoint);
    }

    return corners;
  }

  /**
   * Calculate curvature at a point
   */
  private static getCurvature(p1: Point, p2: Point, p3: Point): number {
    const angle1 = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    const angle2 = Math.atan2(p3.y - p2.y, p3.x - p2.x);
    let diff = Math.abs(angle2 - angle1);
    if (diff > Math.PI) diff = 2 * Math.PI - diff;
    return diff;
  }

  /**
   * Get angles between consecutive corners
   */
  private static getAngles(corners: Point[]): number[] {
    const angles: number[] = [];
    for (let i = 0; i < corners.length; i++) {
      const prev = corners[(i - 1 + corners.length) % corners.length];
      const curr = corners[i];
      const next = corners[(i + 1) % corners.length];

      const angle1 = Math.atan2(curr.y - prev.y, curr.x - prev.x);
      const angle2 = Math.atan2(next.y - curr.y, next.x - curr.x);
      let angle = Math.abs((angle2 - angle1) * 180 / Math.PI);
      if (angle > 180) angle = 360 - angle;
      angles.push(angle);
    }
    return angles;
  }

  /**
   * Calculate distance between two points
   */
  private static distance(p1: Point, p2: Point): number {
    return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
  }

  /**
   * Calculate distance from point to line segment
   */
  private static pointToLineDistance(point: Point, lineStart: Point, lineEnd: Point): number {
    const lineLength = this.distance(lineStart, lineEnd);
    if (lineLength === 0) return this.distance(point, lineStart);

    const t = Math.max(0, Math.min(1,
      ((point.x - lineStart.x) * (lineEnd.x - lineStart.x) +
       (point.y - lineStart.y) * (lineEnd.y - lineStart.y)) / (lineLength ** 2)
    ));

    const projection = {
      x: lineStart.x + t * (lineEnd.x - lineStart.x),
      y: lineStart.y + t * (lineEnd.y - lineStart.y),
    };

    return this.distance(point, projection);
  }

  /**
   * Get bounding box for points
   */
  private static getBounds(points: Point[]): { x: number; y: number; width: number; height: number } {
    if (points.length === 0) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const point of points) {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    }

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }
}
