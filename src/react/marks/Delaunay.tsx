// @ts-nocheck — React components importing from untyped JS modules
import React, {useMemo} from "react";
import {Delaunay} from "d3";
import {useMark} from "../useMark.js";
import {indirectStyleProps, directStyleProps, channelStyleProps, computeTransform} from "../styles.js";
import type {ChannelSpec} from "../PlotContext.js";

// --- DelaunayLink ---

const linkDefaults = {
  ariaLabel: "delaunay-link",
  fill: "none" as any,
  stroke: "currentColor",
  strokeWidth: 1
};

export interface DelaunayProps {
  data?: any;
  x?: any;
  y?: any;
  z?: any;
  fill?: any;
  stroke?: any;
  strokeWidth?: any;
  strokeOpacity?: any;
  opacity?: any;
  title?: any;
  tip?: any;
  dx?: number;
  dy?: number;
  className?: string;
  [key: string]: any;
}

export function DelaunayLink({
  data,
  x,
  y,
  z,
  stroke,
  strokeWidth,
  strokeOpacity,
  opacity,
  title,
  tip,
  dx = 0,
  dy = 0,
  className,
  ...restOptions
}: DelaunayProps) {
  const channels: Record<string, ChannelSpec> = useMemo(
    () => ({
      x: {value: x, scale: "x"},
      y: {value: y, scale: "y"},
      ...(z != null ? {z: {value: z, optional: true}} : {}),
      ...(typeof stroke === "string" && stroke !== "none" && stroke !== "currentColor" && !/^#|^rgb|^hsl/.test(stroke)
        ? {stroke: {value: stroke, scale: "auto", optional: true}}
        : {}),
      ...(typeof opacity === "string" || typeof opacity === "function"
        ? {opacity: {value: opacity, scale: "auto", optional: true}}
        : {})
    }),
    [x, y, z, stroke, opacity]
  );

  const markOptions = useMemo(
    () => ({
      ...linkDefaults,
      ...restOptions,
      stroke:
        typeof stroke === "string" && (stroke === "none" || stroke === "currentColor" || /^#|^rgb|^hsl/.test(stroke))
          ? stroke
          : linkDefaults.stroke,
      strokeWidth: typeof strokeWidth === "number" ? strokeWidth : linkDefaults.strokeWidth,
      dx,
      dy,
      className
    }),
    [stroke, strokeWidth, dx, dy, className, restOptions]
  );

  const {values, index, scales, dimensions} = useMark({
    data,
    channels,
    ariaLabel: linkDefaults.ariaLabel,
    tip,
    ...markOptions
  });

  if (!values || !index || !dimensions) return null;

  const {x: X, y: Y} = values;

  // Compute Delaunay triangulation
  const edges = useMemo(() => {
    if (!X || !Y || !index.length) return [];
    const points = index.map((i) => [X[i], Y[i]] as [number, number]);
    const delaunay = Delaunay.from(points);
    const result: Array<{i1: number; i2: number}> = [];
    const {halfedges, triangles} = delaunay;
    for (let j = 0; j < halfedges.length; ++j) {
      const k = halfedges[j];
      if (k < j) continue;
      result.push({i1: index[triangles[j]], i2: index[triangles[k >= 0 ? k : j]]});
    }
    return result;
  }, [X, Y, index]);

  const transform = computeTransform({dx, dy}, scales ?? {});
  const groupProps = {
    ...indirectStyleProps(markOptions, dimensions),
    ...(transform ? {transform} : {})
  };

  return (
    <g {...groupProps}>
      {edges.map(({i1, i2}, j) => (
        <line key={j} x1={X[i1]} y1={Y[i1]} x2={X[i2]} y2={Y[i2]} {...directStyleProps(markOptions)} />
      ))}
    </g>
  );
}

// --- DelaunayMesh ---

export function DelaunayMesh({
  data,
  x,
  y,
  stroke = "currentColor",
  strokeWidth = 1,
  strokeOpacity,
  fill = "none",
  dx = 0,
  dy = 0,
  className,
  ...restOptions
}: DelaunayProps) {
  const channels: Record<string, ChannelSpec> = useMemo(
    () => ({
      x: {value: x, scale: "x"},
      y: {value: y, scale: "y"}
    }),
    [x, y]
  );

  const markOptions = useMemo(
    () => ({
      ariaLabel: "delaunay-mesh",
      fill,
      stroke: typeof stroke === "string" ? stroke : "currentColor",
      strokeWidth: typeof strokeWidth === "number" ? strokeWidth : 1,
      ...restOptions,
      dx,
      dy,
      className
    }),
    [fill, stroke, strokeWidth, dx, dy, className, restOptions]
  );

  const {values, index, scales, dimensions} = useMark({data, channels, ...markOptions});

  if (!values || !index || !dimensions) return null;

  const {x: X, y: Y} = values;

  const meshPath = useMemo(() => {
    if (!X || !Y || !index.length) return "";
    const points = index.map((i) => [X[i], Y[i]] as [number, number]);
    const delaunay = Delaunay.from(points);
    const context = new Path2DContext();
    delaunay.render(context);
    return context.toString();
  }, [X, Y, index]);

  const transform = computeTransform({dx, dy}, scales ?? {});

  return (
    <path
      d={meshPath}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeOpacity={strokeOpacity}
      transform={transform}
      className={className}
      aria-label="delaunay-mesh"
    />
  );
}

// --- Hull ---

export function Hull({
  data,
  x,
  y,
  stroke = "currentColor",
  strokeWidth = 1.5,
  strokeOpacity,
  fill = "none",
  dx = 0,
  dy = 0,
  className,
  ...restOptions
}: DelaunayProps) {
  const channels: Record<string, ChannelSpec> = useMemo(
    () => ({
      x: {value: x, scale: "x"},
      y: {value: y, scale: "y"}
    }),
    [x, y]
  );

  const markOptions = useMemo(
    () => ({
      ariaLabel: "hull",
      fill,
      stroke: typeof stroke === "string" ? stroke : "currentColor",
      strokeWidth: typeof strokeWidth === "number" ? strokeWidth : 1.5,
      ...restOptions,
      dx,
      dy,
      className
    }),
    [fill, stroke, strokeWidth, dx, dy, className, restOptions]
  );

  const {values, index, scales, dimensions} = useMark({data, channels, ...markOptions});

  if (!values || !index || !dimensions) return null;

  const {x: X, y: Y} = values;

  const hullPath = useMemo(() => {
    if (!X || !Y || !index.length) return "";
    const points = index.map((i) => [X[i], Y[i]] as [number, number]);
    const delaunay = Delaunay.from(points);
    const context = new Path2DContext();
    delaunay.renderHull(context);
    return context.toString();
  }, [X, Y, index]);

  const transform = computeTransform({dx, dy}, scales ?? {});

  return (
    <path
      d={hullPath}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeOpacity={strokeOpacity}
      transform={transform}
      className={className}
      aria-label="hull"
    />
  );
}

// --- Voronoi ---

export function Voronoi({
  data,
  x,
  y,
  fill,
  stroke = "currentColor",
  strokeWidth = 1,
  strokeOpacity,
  opacity,
  title,
  tip,
  dx = 0,
  dy = 0,
  className,
  ...restOptions
}: DelaunayProps) {
  const channels: Record<string, ChannelSpec> = useMemo(
    () => ({
      x: {value: x, scale: "x"},
      y: {value: y, scale: "y"},
      ...(typeof fill === "string" && fill !== "none" && fill !== "currentColor" && !/^#|^rgb|^hsl/.test(fill)
        ? {fill: {value: fill, scale: "auto", optional: true}}
        : {}),
      ...(typeof opacity === "string" || typeof opacity === "function"
        ? {opacity: {value: opacity, scale: "auto", optional: true}}
        : {}),
      ...(title != null ? {title: {value: title, optional: true, filter: null}} : {})
    }),
    [x, y, fill, opacity, title]
  );

  const markOptions = useMemo(
    () => ({
      ariaLabel: "voronoi",
      fill:
        typeof fill === "string" && (fill === "none" || fill === "currentColor" || /^#|^rgb|^hsl/.test(fill))
          ? fill
          : "none",
      stroke: typeof stroke === "string" ? stroke : "currentColor",
      strokeWidth: typeof strokeWidth === "number" ? strokeWidth : 1,
      ...restOptions,
      dx,
      dy,
      className
    }),
    [fill, stroke, strokeWidth, dx, dy, className, restOptions]
  );

  const {values, index, scales, dimensions} = useMark({data, channels, tip, ...markOptions});

  if (!values || !index || !dimensions) return null;

  const {x: X, y: Y} = values;
  const {marginLeft, marginTop, width, height, marginRight, marginBottom} = dimensions;

  const cellPaths = useMemo(() => {
    if (!X || !Y || !index.length) return [];
    const points = index.map((i) => [X[i], Y[i]] as [number, number]);
    const delaunay = Delaunay.from(points);
    const voronoi = delaunay.voronoi([marginLeft, marginTop, width - marginRight, height - marginBottom]);
    return index.map((_, j) => {
      const context = new Path2DContext();
      voronoi.renderCell(j, context);
      return context.toString();
    });
  }, [X, Y, index, marginLeft, marginTop, width, height, marginRight, marginBottom]);

  const transform = computeTransform({dx, dy}, scales ?? {});
  const groupProps = {
    ...indirectStyleProps(markOptions, dimensions),
    ...(transform ? {transform} : {})
  };

  return (
    <g {...groupProps}>
      {cellPaths.map((d, j) => (
        <path key={j} d={d} {...directStyleProps(markOptions)} {...channelStyleProps(index[j], values)}>
          {values.title && values.title[index[j]] != null && <title>{`${values.title[index[j]]}`}</title>}
        </path>
      ))}
    </g>
  );
}

// --- VoronoiMesh ---

export function VoronoiMesh({
  data,
  x,
  y,
  stroke = "currentColor",
  strokeWidth = 1,
  strokeOpacity,
  fill = "none",
  dx = 0,
  dy = 0,
  className,
  ...restOptions
}: DelaunayProps) {
  const channels: Record<string, ChannelSpec> = useMemo(
    () => ({
      x: {value: x, scale: "x"},
      y: {value: y, scale: "y"}
    }),
    [x, y]
  );

  const markOptions = useMemo(
    () => ({
      ariaLabel: "voronoi-mesh",
      fill,
      stroke: typeof stroke === "string" ? stroke : "currentColor",
      strokeWidth: typeof strokeWidth === "number" ? strokeWidth : 1,
      ...restOptions,
      dx,
      dy,
      className
    }),
    [fill, stroke, strokeWidth, dx, dy, className, restOptions]
  );

  const {values, index, scales, dimensions} = useMark({data, channels, ...markOptions});

  if (!values || !index || !dimensions) return null;

  const {x: X, y: Y} = values;
  const {marginLeft, marginTop, width, height, marginRight, marginBottom} = dimensions;

  const meshPath = useMemo(() => {
    if (!X || !Y || !index.length) return "";
    const points = index.map((i) => [X[i], Y[i]] as [number, number]);
    const delaunay = Delaunay.from(points);
    const voronoi = delaunay.voronoi([marginLeft, marginTop, width - marginRight, height - marginBottom]);
    const context = new Path2DContext();
    voronoi.render(context);
    return context.toString();
  }, [X, Y, index, marginLeft, marginTop, width, height, marginRight, marginBottom]);

  const transform = computeTransform({dx, dy}, scales ?? {});

  return (
    <path
      d={meshPath}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeOpacity={strokeOpacity}
      transform={transform}
      className={className}
      aria-label="voronoi-mesh"
    />
  );
}

// Simple path context that builds an SVG path string (replaces canvas context)
class Path2DContext {
  private _d: string[] = [];
  moveTo(x: number, y: number) {
    this._d.push(`M${x},${y}`);
  }
  lineTo(x: number, y: number) {
    this._d.push(`L${x},${y}`);
  }
  closePath() {
    this._d.push("Z");
  }
  arc(x: number, y: number, r: number, a0: number, a1: number) {
    const x0 = x + r * Math.cos(a0),
      y0 = y + r * Math.sin(a0);
    const x1 = x + r * Math.cos(a1),
      y1 = y + r * Math.sin(a1);
    const large = Math.abs(a1 - a0) > Math.PI ? 1 : 0;
    this._d.push(`M${x0},${y0}A${r},${r},0,${large},1,${x1},${y1}`);
  }
  rect(x: number, y: number, w: number, h: number) {
    this._d.push(`M${x},${y}h${w}v${h}h${-w}Z`);
  }
  toString() {
    return this._d.join("");
  }
}
