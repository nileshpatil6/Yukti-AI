// Simplified and more accurate shape recognition
import { ShapeRecognitionResult } from '../types/drawing';

export interface Point {
  x: number;
  y: number;
}

/**
 * Accurate shape recognizer with proper error calculation
 * Follows this order: Line → Rectangle → Circle → Polygon → Freehand
 */
export class ShapeRecognizer {
  private static readonly MAX_RESAMPLE_POINTS = 64;
  private static readonly RDP_EPSILON = 2.0;
  
  // Normalized error thresholds (0-1)
  private static readonly LINE_ERROR_THRESHOLD = 0.03;      // 3% - very strict
  private static readonly RECTANGLE_ERROR_THRESHOLD = 0.12;  // 12%
  private static readonly CIRCLE_ERROR_THRESHOLD = 0.10;     // 10%
  private static readonly POLYGON_ERROR_THRESHOLD = 0.15;    // 15%

  /**
   * Main recognition function
   */
  static recognize(points: Point[]): ShapeRecognitionResult {
    console.log('[ShapeRecognizer] recognize() called with', points.length, 'points');

    if (points.length < 3) {
      return {
        type: 'polygon',
        confidence: 0,
        bounds: this.getBounds(points),
      };
    }

    // Resample and simplify
    const resampled = this.resamplePoints(points, this.MAX_RESAMPLE_POINTS);
    const simplified = this.simplifyRDP(resampled, this.RDP_EPSILON);
    
    console.log('[ShapeRecognizer] Simplified to', simplified.length, 'points');

    const bounds = this.getBounds(points);
    const boundsDiag = this.getBoundsDiagonal(bounds);

    // Try each shape type and track errors
    const results: { type: string; error: number; confidence: number; data: any }[] = [];

    // 1. Try LINE
    const lineResult = this.tryLine(points, simplified, boundsDiag);
    results.push({ type: 'line', error: lineResult.error, confidence: lineResult.confidence, data: lineResult });
    console.log('[ShapeRecognizer] Line error:', lineResult.error.toFixed(4), 'threshold:', this.LINE_ERROR_THRESHOLD);

    // 2. Try RECTANGLE
    const rectResult = this.tryRectangle(points, simplified, boundsDiag);
    results.push({ type: 'rectangle', error: rectResult.error, confidence: rectResult.confidence, data: rectResult });
    console.log('[ShapeRecognizer] Rectangle error:', rectResult.error.toFixed(4), 'threshold:', this.RECTANGLE_ERROR_THRESHOLD);

    // 3. Try CIRCLE
    const circleResult = this.tryCircle(points, simplified, boundsDiag);
    results.push({ type: 'circle', error: circleResult.error, confidence: circleResult.confidence, data: circleResult });
    console.log('[ShapeRecognizer] Circle error:', circleResult.error.toFixed(4), 'threshold:', this.CIRCLE_ERROR_THRESHOLD);

    // 4. Try POLYGON
    const polyResult = this.tryPolygon(points, simplified, boundsDiag);
    results.push({ type: 'polygon', error: polyResult.error, confidence: polyResult.confidence, data: polyResult });
    console.log('[ShapeRecognizer] Polygon error:', polyResult.error.toFixed(4), 'threshold:', this.POLYGON_ERROR_THRESHOLD);

    // Select best fit based on lowest error AND threshold
    let bestResult = null;
    let bestThreshold = Infinity;

    // Check in order of preference
    const lineRes = results.find(r => r.type === 'line');
    if (lineRes && lineRes.error < this.LINE_ERROR_THRESHOLD && lineRes.error < bestThreshold) {
      bestResult = { ...lineRes.data, type: 'line', detected: true };
      bestThreshold = lineRes.error;
      console.log('[ShapeRecognizer] ✓ Accepted LINE');
    }

    const rectRes = results.find(r => r.type === 'rectangle');
    if (rectRes && rectRes.error < this.RECTANGLE_ERROR_THRESHOLD && rectRes.error < bestThreshold) {
      bestResult = { ...rectRes.data, type: 'rectangle', detected: true };
      bestThreshold = rectRes.error;
      console.log('[ShapeRecognizer] ✓ Accepted RECTANGLE');
    }

    const circleRes = results.find(r => r.type === 'circle');
    if (circleRes && circleRes.error < this.CIRCLE_ERROR_THRESHOLD && circleRes.error < bestThreshold) {
      bestResult = { ...circleRes.data, type: 'circle', detected: true };
      bestThreshold = circleRes.error;
      console.log('[ShapeRecognizer] ✓ Accepted CIRCLE');
    }

    const polyRes = results.find(r => r.type === 'polygon');
    if (polyRes && polyRes.error < this.POLYGON_ERROR_THRESHOLD && polyRes.error < bestThreshold) {
      bestResult = { ...polyRes.data, type: 'polygon', detected: true };
      bestThreshold = polyRes.error;
      console.log('[ShapeRecognizer] ✓ Accepted POLYGON');
    }

    if (bestResult && bestResult.detected) {
      console.log('[ShapeRecognizer] Final result: type=' + bestResult.type + ', confidence=' + bestResult.confidence.toFixed(3));
      return {
        type: bestResult.type as any,
        confidence: bestResult.confidence,
        bounds: bestResult.bounds,
        points: bestResult.points,
      };
    }

    // Fallback: return simplified points as polygon
    console.log('[ShapeRecognizer] No shape matched, using freehand polygon');
    return {
      type: 'polygon',
      confidence: 0,
      bounds,
      points: simplified,
    };
  }

  /**
   * Try to fit a line
   */
  private static tryLine(original: Point[], simplified: Point[], boundsDiag: number): any {
    if (simplified.length < 2) {
      return { error: 1.0, confidence: 0, bounds: this.getBounds(original) };
    }

    const start = simplified[0];
    const end = simplified[simplified.length - 1];

    // Calculate mean perpendicular distance
    let totalDist = 0;
    for (const p of original) {
      totalDist += this.pointToLineDistance(p, start, end);
    }
    const meanDist = totalDist / original.length;
    const error = boundsDiag > 0 ? meanDist / boundsDiag : 0;
    const confidence = Math.max(0, 1 - error / this.LINE_ERROR_THRESHOLD);

    return {
      error,
      confidence,
      bounds: this.getBounds(original),
      points: [start, end],
    };
  }

  /**
   * Try to fit a rectangle
   */
  private static tryRectangle(original: Point[], _simplified: Point[], boundsDiag: number): any {
    // Get the axis-aligned bounding box
    const bounds = this.getBounds(original);

    // For a good rectangle, points should be close to the edges
    let edgeDistance = 0;

    for (const p of original) {
      let minEdgeDist = Infinity;

      // Distance to left edge
      minEdgeDist = Math.min(minEdgeDist, Math.abs(p.x - bounds.x));
      // Distance to right edge
      minEdgeDist = Math.min(minEdgeDist, Math.abs(p.x - (bounds.x + bounds.width)));
      // Distance to top edge
      minEdgeDist = Math.min(minEdgeDist, Math.abs(p.y - bounds.y));
      // Distance to bottom edge
      minEdgeDist = Math.min(minEdgeDist, Math.abs(p.y - (bounds.y + bounds.height)));

      edgeDistance += minEdgeDist;
    }

    const meanEdgeDist = edgeDistance / original.length;
    const error = boundsDiag > 0 ? meanEdgeDist / boundsDiag : 0;
    const confidence = Math.max(0, 1 - error / this.RECTANGLE_ERROR_THRESHOLD);

    return {
      error,
      confidence,
      bounds,
      points: [
        { x: bounds.x, y: bounds.y },
        { x: bounds.x + bounds.width, y: bounds.y },
        { x: bounds.x + bounds.width, y: bounds.y + bounds.height },
        { x: bounds.x, y: bounds.y + bounds.height },
      ],
    };
  }

  /**
   * Try to fit a circle
   */
  private static tryCircle(original: Point[], _simplified: Point[], boundsDiag: number): any {
    // Fit circle using least squares
    const center = this.fitCircleCenter(original);
    const radius = this.getAverageRadius(original, center);

    if (radius === 0) {
      return { error: 1.0, confidence: 0, bounds: this.getBounds(original) };
    }

    // Calculate error as deviation from ideal radius
    let radiusError = 0;
    for (const p of original) {
      const dist = this.distance(p, center);
      radiusError += Math.abs(dist - radius);
    }
    const meanRadiusError = radiusError / original.length;
    const error = boundsDiag > 0 ? meanRadiusError / boundsDiag : 0;
    const confidence = Math.max(0, 1 - error / this.CIRCLE_ERROR_THRESHOLD);

    const bounds = this.getBounds(original);

    return {
      error,
      confidence,
      bounds,
      points: [center],
      metadata: { center, radius },
    };
  }

  /**
   * Try to fit a polygon
   */
  private static tryPolygon(original: Point[], simplified: Point[], boundsDiag: number): any {
    // Use simplified points as polygon vertices
    if (simplified.length < 3) {
      return { error: 1.0, confidence: 0, bounds: this.getBounds(original) };
    }

    // Calculate distance from each point to nearest polygon edge
    let totalError = 0;
    for (const p of original) {
      const dist = this.pointToPolygonDistance(p, simplified);
      totalError += dist;
    }

    const meanError = totalError / original.length;
    const error = boundsDiag > 0 ? meanError / boundsDiag : 0;
    const confidence = Math.max(0, 1 - error / this.POLYGON_ERROR_THRESHOLD);

    const bounds = this.getBounds(original);

    return {
      error,
      confidence,
      bounds,
      points: simplified,
    };
  }

  /**
   * Resample points to fixed count using arc-length parameterization
   */
  private static resamplePoints(points: Point[], count: number): Point[] {
    if (points.length <= 2) return points;

    // Calculate cumulative arc length
    const lengths: number[] = [0];
    let totalLength = 0;

    for (let i = 1; i < points.length; i++) {
      const dist = this.distance(points[i - 1], points[i]);
      totalLength += dist;
      lengths.push(totalLength);
    }

    if (totalLength === 0) return points;

    // Resample at uniform intervals
    const resampled: Point[] = [];
    for (let i = 0; i < count; i++) {
      const targetLength = (i / (count - 1)) * totalLength;
      let idx = 0;

      for (let j = 0; j < lengths.length; j++) {
        if (lengths[j] >= targetLength) {
          idx = j;
          break;
        }
      }

      if (idx === 0) {
        resampled.push({ ...points[0] });
      } else {
        const p0 = points[idx - 1];
        const p1 = points[idx];
        const segLen = lengths[idx] - lengths[idx - 1];
        const t = segLen > 0 ? (targetLength - lengths[idx - 1]) / segLen : 0;

        resampled.push({
          x: p0.x + t * (p1.x - p0.x),
          y: p0.y + t * (p1.y - p0.y),
        });
      }
    }

    return resampled;
  }

  /**
   * Simplify using Ramer-Douglas-Peucker algorithm
   */
  private static simplifyRDP(points: Point[], epsilon: number): Point[] {
    if (points.length < 3) return points;

    const start = points[0];
    const end = points[points.length - 1];

    let maxDist = 0;
    let maxIdx = 0;

    for (let i = 1; i < points.length - 1; i++) {
      const dist = this.pointToLineDistance(points[i], start, end);
      if (dist > maxDist) {
        maxDist = dist;
        maxIdx = i;
      }
    }

    if (maxDist > epsilon) {
      const left = this.simplifyRDP(points.slice(0, maxIdx + 1), epsilon);
      const right = this.simplifyRDP(points.slice(maxIdx), epsilon);
      return [...left.slice(0, -1), ...right];
    }

    return [start, end];
  }

  /**
   * Fit circle center using least squares
   */
  private static fitCircleCenter(points: Point[]): Point {
    if (points.length === 0) return { x: 0, y: 0 };

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

    const denom = A * C - B * B;

    if (Math.abs(denom) < 0.0001) {
      // Fallback to centroid
      return { x: sumX / n, y: sumY / n };
    }

    return {
      x: (D * C - B * E) / denom,
      y: (A * E - B * D) / denom,
    };
  }

  /**
   * Get average radius from center
   */
  private static getAverageRadius(points: Point[], center: Point): number {
    if (points.length === 0) return 0;

    let sum = 0;
    for (const p of points) {
      sum += this.distance(p, center);
    }

    return sum / points.length;
  }

  /**
   * Distance between two points
   */
  private static distance(p1: Point, p2: Point): number {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Perpendicular distance from point to line
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

    const closest = {
      x: lineStart.x + t * dx,
      y: lineStart.y + t * dy,
    };

    return this.distance(point, closest);
  }

  /**
   * Distance from point to nearest polygon edge
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
   * Get bounding box
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
      width: maxX - minX || 1,
      height: maxY - minY || 1,
    };
  }

  /**
   * Get diagonal of bounding box
   */
  private static getBoundsDiagonal(bounds: { width: number; height: number }): number {
    return Math.sqrt(bounds.width * bounds.width + bounds.height * bounds.height);
  }
}
