// Advanced shape recognition with resampling, smoothing, and geometric fitting
import { ShapeRecognitionResult } from '../types/drawing';

export interface Point {
  x: number;
  y: number;
}

interface FitResult {
  type: string;
  normalizedError: number;
  points?: Point[];
  bounds: { x: number; y: number; width: number; height: number };
  metadata?: any;
}

/**
 * Advanced shape recognizer using:
 * 1. Resampling to fixed number of points
 * 2. Smoothing with moving average
 * 3. Simplification with Ramer-Douglas-Peucker
 * 4. Geometric fitting (line, rectangle, circle, polygon)
 * 5. Error-based selection
 */
export class ShapeRecognizer {
  private static readonly RESAMPLE_COUNT = 64;
  private static readonly SMOOTH_WINDOW = 3;
  private static readonly RDP_EPSILON = 2.0;
  private static readonly ERROR_THRESHOLD = 0.15; // 15% normalized error
  private static readonly CORNER_THRESHOLD = 20; // degrees for corner detection

  /**
   * Main recognition function - orchestrates the entire pipeline
   */
  static recognize(points: Point[]): ShapeRecognitionResult {
    console.log('[ShapeRecognizer] Starting recognition with', points.length, 'points');

    if (points.length < 2) {
      return {
        type: 'unknown',
        confidence: 0,
        bounds: this.getBounds(points),
      };
    }

    // Step 1: Resample to fixed number of points
    const resampled = this.resample(points, this.RESAMPLE_COUNT);
    console.log('[ShapeRecognizer] Resampled to', resampled.length, 'points');

    // Step 2: Smooth with moving average
    const smoothed = this.smooth(resampled, this.SMOOTH_WINDOW);
    console.log('[ShapeRecognizer] Smoothed points');

    // Step 3: Simplify with RDP
    const simplified = this.simplifyRDP(smoothed, this.RDP_EPSILON);
    console.log('[ShapeRecognizer] Simplified to', simplified.length, 'points');

    // Step 4: Try fits in order and compute errors
    const bounds = this.getBounds(points);
    const boundsDiag = this.getBoundsDiagonal(bounds);

    const results: FitResult[] = [];

    // Try line fit
    const lineFit = this.fitLine(simplified, points, boundsDiag);
    results.push(lineFit);
    console.log('[ShapeRecognizer] Line fit error:', lineFit.normalizedError.toFixed(3));

    // Try rectangle fit
    const rectFit = this.fitRectangle(simplified, points, boundsDiag);
    results.push(rectFit);
    console.log('[ShapeRecognizer] Rectangle fit error:', rectFit.normalizedError.toFixed(3));

    // Try circle fit
    const circleFit = this.fitCircle(simplified, points, boundsDiag);
    results.push(circleFit);
    console.log('[ShapeRecognizer] Circle fit error:', circleFit.normalizedError.toFixed(3));

    // Try polygon (triangle, quad) fit
    const polyFit = this.fitPolygon(simplified, points, boundsDiag);
    results.push(polyFit);
    console.log('[ShapeRecognizer] Polygon fit error:', polyFit.normalizedError.toFixed(3));

    // Step 5: Select best fit
    const bestFit = results.reduce((best, current) =>
      current.normalizedError < best.normalizedError ? current : best
    );

    console.log('[ShapeRecognizer] Best fit:', {
      type: bestFit.type,
      error: bestFit.normalizedError.toFixed(3),
      threshold: this.ERROR_THRESHOLD,
      accepted: bestFit.normalizedError < this.ERROR_THRESHOLD
    });

    // Accept if error is below threshold
    if (bestFit.normalizedError < this.ERROR_THRESHOLD) {
      return {
        type: (bestFit.type as 'circle' | 'rectangle' | 'square' | 'triangle' | 'line' | 'ellipse' | 'polygon'),
        confidence: Math.max(0, 1 - bestFit.normalizedError / this.ERROR_THRESHOLD),
        bounds: bestFit.bounds,
        points: bestFit.points,
      };
    }

    // Fallback to freehand - treat as polygon
    return {
      type: 'polygon',
      confidence: 0,
      bounds,
      points: simplified,
    };
  }

  /**
   * Step 1: Resample points to fixed count
   * Uses arc-length parameterization for uniform spacing
   */
  private static resample(points: Point[], targetCount: number): Point[] {
    if (points.length <= 2) return points;

    // Calculate total arc length
    let totalLength = 0;
    const segmentLengths: number[] = [0];
    for (let i = 1; i < points.length; i++) {
      const dist = this.distance(points[i - 1], points[i]);
      totalLength += dist;
      segmentLengths.push(totalLength);
    }

    if (totalLength === 0) return points;

    // Resample at uniform arc-length intervals
    const resampled: Point[] = [];
    const interval = totalLength / (targetCount - 1);

    for (let i = 0; i < targetCount; i++) {
      const targetLength = i * interval;

      // Find the segment containing this length
      let segIdx = 0;
      for (let j = 0; j < segmentLengths.length; j++) {
        if (segmentLengths[j] >= targetLength) {
          segIdx = j;
          break;
        }
      }

      if (segIdx === 0) {
        resampled.push({ ...points[0] });
      } else if (segIdx >= points.length) {
        resampled.push({ ...points[points.length - 1] });
      } else {
        // Interpolate between segIdx-1 and segIdx
        const p0 = points[segIdx - 1];
        const p1 = points[segIdx];
        const segLength = segmentLengths[segIdx] - segmentLengths[segIdx - 1];
        const localLength = targetLength - segmentLengths[segIdx - 1];
        const t = segLength > 0 ? localLength / segLength : 0;

        resampled.push({
          x: p0.x + t * (p1.x - p0.x),
          y: p0.y + t * (p1.y - p0.y),
        });
      }
    }

    return resampled;
  }

  /**
   * Step 2: Smooth with moving average
   */
  private static smooth(points: Point[], windowSize: number): Point[] {
    if (points.length < windowSize) return points;

    const smoothed: Point[] = [];
    const halfWindow = Math.floor(windowSize / 2);

    for (let i = 0; i < points.length; i++) {
      let sumX = 0, sumY = 0, count = 0;

      for (let j = Math.max(0, i - halfWindow); j <= Math.min(points.length - 1, i + halfWindow); j++) {
        sumX += points[j].x;
        sumY += points[j].y;
        count++;
      }

      smoothed.push({
        x: sumX / count,
        y: sumY / count,
      });
    }

    return smoothed;
  }

  /**
   * Step 3: Simplify with Ramer-Douglas-Peucker algorithm
   */
  private static simplifyRDP(points: Point[], epsilon: number): Point[] {
    if (points.length < 3) return points;

    // Find point with maximum distance from line
    let maxDist = 0;
    let maxIdx = 0;
    const start = points[0];
    const end = points[points.length - 1];

    for (let i = 1; i < points.length - 1; i++) {
      const dist = this.pointToLineDistance(points[i], start, end);
      if (dist > maxDist) {
        maxDist = dist;
        maxIdx = i;
      }
    }

    // If max distance is greater than epsilon, recursively simplify
    if (maxDist > epsilon) {
      const left = this.simplifyRDP(points.slice(0, maxIdx + 1), epsilon);
      const right = this.simplifyRDP(points.slice(maxIdx), epsilon);
      return [...left.slice(0, -1), ...right];
    } else {
      return [start, end];
    }
  }

  /**
   * Fit a line to the points
   */
  private static fitLine(simplified: Point[], original: Point[], boundsDiag: number): FitResult {
    if (simplified.length < 2) {
      return { type: 'line', normalizedError: 1.0, bounds: this.getBounds(original) };
    }

    const start = simplified[0];
    const end = simplified[simplified.length - 1];

    // Calculate error as mean perpendicular distance
    let totalError = 0;
    for (const point of original) {
      const dist = this.pointToLineDistance(point, start, end);
      totalError += dist;
    }
    const meanError = totalError / original.length;
    const normalizedError = boundsDiag > 0 ? meanError / boundsDiag : 0;

    return {
      type: 'line',
      normalizedError,
      bounds: this.getBounds(original),
      points: [start, end],
    };
  }

  /**
   * Fit a rectangle by detecting corners
   */
  private static fitRectangle(simplified: Point[], original: Point[], boundsDiag: number): FitResult {
    if (simplified.length < 4) {
      return { type: 'rectangle', normalizedError: 1.0, bounds: this.getBounds(original) };
    }

    // Detect corners using angles
    const corners: Point[] = [];
    for (let i = 0; i < simplified.length; i++) {
      const prev = simplified[(i - 1 + simplified.length) % simplified.length];
      const curr = simplified[i];
      const next = simplified[(i + 1) % simplified.length];

      const angle = this.getAngle(prev, curr, next);
      // Look for right angles (85-95 degrees)
      if (Math.abs(angle - 90) < this.CORNER_THRESHOLD) {
        corners.push(curr);
      }
    }

    // If we found 4 corners, fit rectangle
    if (corners.length >= 4) {
      // Get bounding box of corners
      const bounds = this.getBounds(corners);
      const error = this.calculateRectangleError(original, bounds, boundsDiag);

      return {
        type: 'rectangle',
        normalizedError: error,
        bounds,
        points: [
          { x: bounds.x, y: bounds.y },
          { x: bounds.x + bounds.width, y: bounds.y },
          { x: bounds.x + bounds.width, y: bounds.y + bounds.height },
          { x: bounds.x, y: bounds.y + bounds.height },
        ],
      };
    }

    // Fallback: use original bounds
    const bounds = this.getBounds(original);
    const error = this.calculateRectangleError(original, bounds, boundsDiag);

    return {
      type: 'rectangle',
      normalizedError: error,
      bounds,
    };
  }

  /**
   * Fit a circle using least squares
   */
  private static fitCircle(simplified: Point[], original: Point[], boundsDiag: number): FitResult {
    if (simplified.length < 3) {
      return { type: 'circle', normalizedError: 1.0, bounds: this.getBounds(original) };
    }

    // Use algebraic fit for circle
    const center = this.fitCircleCenter(simplified);
    const radius = this.getAverageRadius(simplified, center);

    // Calculate error
    let totalError = 0;
    for (const point of original) {
      const dist = this.distance(point, center);
      const error = Math.abs(dist - radius);
      totalError += error;
    }
    const meanError = totalError / original.length;
    const normalizedError = boundsDiag > 0 ? meanError / boundsDiag : 0;

    const bounds = this.getBounds(original);

    return {
      type: 'circle',
      normalizedError,
      bounds,
      metadata: { center, radius },
    };
  }

  /**
   * Fit a polygon (detect triangle or quad)
   */
  private static fitPolygon(simplified: Point[], original: Point[], boundsDiag: number): FitResult {
    if (simplified.length < 3) {
      return { type: 'polygon', normalizedError: 1.0, bounds: this.getBounds(original) };
    }

    // For now, use simplified points as polygon vertices
    let totalError = 0;
    for (const point of original) {
      const dist = this.pointToPolygonDistance(point, simplified);
      totalError += dist;
    }
    const meanError = totalError / original.length;
    const normalizedError = boundsDiag > 0 ? meanError / boundsDiag : 0;

    const bounds = this.getBounds(original);
    const vertexCount = simplified.length;

    return {
      type: vertexCount === 3 ? 'triangle' : vertexCount === 4 ? 'square' : 'polygon',
      normalizedError,
      bounds,
      points: simplified,
      metadata: { vertexCount },
    };
  }

  /**
   * Helper: Fit circle center using least squares
   */
  private static fitCircleCenter(points: Point[]): Point {
    let sumX = 0, sumY = 0;
    let sumX2 = 0, sumY2 = 0, sumXY = 0;
    let sumX3 = 0, sumY3 = 0, sumX2Y = 0, sumXY2 = 0;

    const n = points.length;

    for (const p of points) {
      sumX += p.x;
      sumY += p.y;
      sumX2 += p.x * p.x;
      sumY2 += p.y * p.y;
      sumXY += p.x * p.y;
      sumX3 += p.x * p.x * p.x;
      sumY3 += p.y * p.y * p.y;
      sumX2Y += p.x * p.x * p.y;
      sumXY2 += p.x * p.y * p.y;
    }

    const A = n * sumX2 - sumX * sumX;
    const B = n * sumXY - sumX * sumY;
    const C = n * sumY2 - sumY * sumY;
    const D = 0.5 * (n * (sumX3 + sumXY2) - sumX * (sumX2 + sumY2));
    const E = 0.5 * (n * (sumX2Y + sumY3) - sumY * (sumX2 + sumY2));

    const denominator = A * C - B * B;

    if (Math.abs(denominator) < 0.0001) {
      // Fallback to centroid
      return { x: sumX / n, y: sumY / n };
    }

    return {
      x: (D * C - B * E) / denominator,
      y: (A * E - B * D) / denominator,
    };
  }

  /**
   * Helper: Get average radius from center
   */
  private static getAverageRadius(points: Point[], center: Point): number {
    if (points.length === 0) return 0;
    let sumRadius = 0;
    for (const p of points) {
      sumRadius += this.distance(p, center);
    }
    return sumRadius / points.length;
  }

  /**
   * Helper: Calculate rectangle fit error
   */
  private static calculateRectangleError(points: Point[], bounds: { x: number; y: number; width: number; height: number }, boundsDiag: number): number {
    let totalError = 0;

    for (const p of points) {
      let minDist = Infinity;

      // Distance to each edge of rectangle
      // Top edge
      if (p.y >= bounds.y && p.y <= bounds.y + bounds.height) {
        minDist = Math.min(minDist, Math.abs(p.x - bounds.x), Math.abs(p.x - (bounds.x + bounds.width)));
      }
      // Bottom edge (same as top)
      // Left edge
      if (p.x >= bounds.x && p.x <= bounds.x + bounds.width) {
        minDist = Math.min(minDist, Math.abs(p.y - bounds.y), Math.abs(p.y - (bounds.y + bounds.height)));
      }

      // Distance to corners
      for (const corner of [
        { x: bounds.x, y: bounds.y },
        { x: bounds.x + bounds.width, y: bounds.y },
        { x: bounds.x + bounds.width, y: bounds.y + bounds.height },
        { x: bounds.x, y: bounds.y + bounds.height },
      ]) {
        minDist = Math.min(minDist, this.distance(p, corner));
      }

      totalError += minDist;
    }

    const meanError = totalError / points.length;
    return boundsDiag > 0 ? meanError / boundsDiag : 0;
  }

  /**
   * Helper: Distance from point to polygon
   */
  private static pointToPolygonDistance(point: Point, polygon: Point[]): number {
    let minDist = Infinity;

    for (let i = 0; i < polygon.length; i++) {
      const p1 = polygon[i];
      const p2 = polygon[(i + 1) % polygon.length];
      const dist = this.pointToLineDistance(point, p1, p2);
      minDist = Math.min(minDist, dist);
    }

    return minDist;
  }

  /**
   * Helper: Get angle at current point
   */
  private static getAngle(p1: Point, p2: Point, p3: Point): number {
    const v1 = { x: p1.x - p2.x, y: p1.y - p2.y };
    const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };

    const dot = v1.x * v2.x + v1.y * v2.y;
    const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
    const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);

    if (mag1 === 0 || mag2 === 0) return 0;

    const cos = dot / (mag1 * mag2);
    return (Math.acos(Math.max(-1, Math.min(1, cos))) * 180) / Math.PI;
  }

  /**
   * Helper: Distance between two points
   */
  private static distance(p1: Point, p2: Point): number {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Helper: Perpendicular distance from point to line
   */
  private static pointToLineDistance(point: Point, lineStart: Point, lineEnd: Point): number {
    const dx = lineEnd.x - lineStart.x;
    const dy = lineEnd.y - lineStart.y;
    const lengthSq = dx * dx + dy * dy;

    if (lengthSq === 0) {
      return this.distance(point, lineStart);
    }

    let t = ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / lengthSq;
    t = Math.max(0, Math.min(1, t));

    const closestPoint = {
      x: lineStart.x + t * dx,
      y: lineStart.y + t * dy,
    };

    return this.distance(point, closestPoint);
  }

  /**
   * Helper: Get bounds of points
   */
  private static getBounds(points: Point[]): { x: number; y: number; width: number; height: number } {
    if (points.length === 0) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }

    let minX = points[0].x, minY = points[0].y;
    let maxX = points[0].x, maxY = points[0].y;

    for (const p of points) {
      minX = Math.min(minX, p.x);
      minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x);
      maxY = Math.max(maxY, p.y);
    }

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }

  /**
   * Helper: Get diagonal of bounding box
   */
  private static getBoundsDiagonal(bounds: { width: number; height: number }): number {
    return Math.sqrt(bounds.width * bounds.width + bounds.height * bounds.height);
  }
}
