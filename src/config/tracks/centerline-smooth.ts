import type { Vec2 } from '../../core/types.js';

/** Chaikin corner-cutting — rounds sharp bends for gentler racing lines. */
function chaikin(points: Vec2[], closed: boolean): Vec2[] {
  const src = closed ? points.slice(0, -1) : points;
  const out: Vec2[] = [];
  const n = src.length;
  for (let i = 0; i < n; i++) {
    const p0 = src[i]!;
    const p1 = src[(i + 1) % n]!;
    out.push(
      { x: p0.x * 0.75 + p1.x * 0.25, y: p0.y * 0.75 + p1.y * 0.25 },
      { x: p0.x * 0.25 + p1.x * 0.75, y: p0.y * 0.25 + p1.y * 0.75 },
    );
  }
  if (closed && out.length > 0) out.push({ ...out[0]! });
  return out;
}

function catmull(p0: Vec2, p1: Vec2, p2: Vec2, p3: Vec2, t: number): Vec2 {
  const t2 = t * t;
  const t3 = t2 * t;
  return {
    x: 0.5 * ((2 * p1.x) + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
    y: 0.5 * ((2 * p1.y) + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
  };
}

function resampleUniform(points: Vec2[], spacing: number): Vec2[] {
  if (points.length < 2) return points;
  const closed = points.length > 2 &&
    Math.hypot(points[0]!.x - points[points.length - 1]!.x, points[0]!.y - points[points.length - 1]!.y) < 2;
  const pts = closed ? points.slice(0, -1) : points;
  const dense: Vec2[] = [];
  const segs = closed ? pts.length : pts.length - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = pts[(i - 1 + pts.length) % pts.length]!;
    const p1 = pts[i]!;
    const p2 = pts[(i + 1) % pts.length]!;
    const p3 = pts[(i + 2) % pts.length]!;
    const steps = Math.max(4, Math.ceil(Math.hypot(p2.x - p1.x, p2.y - p1.y) / spacing));
    for (let s = 0; s < steps; s++) {
      dense.push(catmull(p0, p1, p2, p3, s / steps));
    }
  }
  if (closed) dense.push({ ...dense[0]! });
  return dense;
}

/** Pull loop toward table centre — wider radius corners, less spin on chase cam. */
function softenLoop(points: Vec2[], cx: number, cy: number, factor: number): Vec2[] {
  return points.map((p) => ({
    x: cx + (p.x - cx) * factor,
    y: cy + (p.y - cy) * factor,
  }));
}

export interface RefineOptions {
  chaikinIterations?: number;
  inset?: number;
  sampleSpacing?: number;
  center?: Vec2;
}

export function refineCenterline(raw: Vec2[], opts: RefineOptions = {}): Vec2[] {
  const {
    chaikinIterations = 2,
    inset = 0.86,
    sampleSpacing = 28,
    center = { x: 600, y: 400 },
  } = opts;
  let pts = softenLoop(raw, center.x, center.y, inset);
  const closed = pts.length > 2 &&
    Math.hypot(pts[0]!.x - pts[pts.length - 1]!.x, pts[0]!.y - pts[pts.length - 1]!.y) < 2;
  for (let i = 0; i < chaikinIterations; i++) {
    pts = chaikin(pts, closed);
  }
  return resampleUniform(pts, sampleSpacing);
}
