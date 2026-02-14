// @ts-nocheck — React components importing from untyped JS modules
import React, {useMemo} from "react";
import {contours as d3Contours, geoPath} from "d3";
import {useMark} from "../useMark.js";
import {indirectStyleProps, directStyleProps} from "../styles.js";
import type {ChannelSpec} from "../PlotContext.js";

const defaults = {
  ariaLabel: "contour",
  fill: "none" as any,
  stroke: "currentColor",
  strokeWidth: 1,
  strokeMiterlimit: 1
};

export interface ContourProps {
  data?: any;
  value?: any;
  x?: any;
  y?: any;
  fill?: any;
  stroke?: any;
  strokeWidth?: any;
  strokeOpacity?: any;
  fillOpacity?: any;
  opacity?: any;
  thresholds?: number | number[];
  blur?: number;
  smooth?: boolean;
  pixelSize?: number;
  width?: number;
  height?: number;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  tip?: any;
  dx?: number;
  dy?: number;
  className?: string;
  [key: string]: any;
}

export function Contour({
  data,
  value,
  x,
  y,
  fill,
  stroke,
  strokeWidth,
  strokeOpacity,
  fillOpacity,
  opacity,
  thresholds = 10,
  smooth = true,
  pixelSize = 2,
  width: gridWidth,
  height: gridHeight,
  x1: boundsX1,
  y1: boundsY1,
  x2: boundsX2,
  y2: boundsY2,
  tip,
  dx = 0,
  dy = 0,
  className,
  ...restOptions
}: ContourProps) {
  const channels: Record<string, ChannelSpec> = useMemo(
    () => ({
      ...(value != null ? {value: {value, optional: true}} : {}),
      ...(x != null ? {x: {value: x, scale: "x", optional: true}} : {}),
      ...(y != null ? {y: {value: y, scale: "y", optional: true}} : {}),
      ...(typeof fill === "string" && fill !== "none" && fill !== "currentColor" && !/^#|^rgb|^hsl/.test(fill)
        ? {fill: {value: fill, scale: "auto", optional: true}}
        : {}),
      ...(typeof opacity === "string" || typeof opacity === "function"
        ? {opacity: {value: opacity, scale: "auto", optional: true}}
        : {})
    }),
    [value, x, y, fill, opacity]
  );

  const markOptions = useMemo(
    () => ({
      ...defaults,
      ...restOptions,
      fill:
        typeof fill === "string" && (fill === "none" || fill === "currentColor" || /^#|^rgb|^hsl/.test(fill))
          ? fill
          : defaults.fill,
      stroke:
        typeof stroke === "string" && (stroke === "none" || stroke === "currentColor" || /^#|^rgb|^hsl/.test(stroke))
          ? stroke
          : defaults.stroke,
      strokeWidth: typeof strokeWidth === "number" ? strokeWidth : defaults.strokeWidth,
      dx,
      dy,
      className
    }),
    [fill, stroke, strokeWidth, dx, dy, className, restOptions]
  );

  const {values, index, dimensions} = useMark({data, channels, ariaLabel: defaults.ariaLabel, tip, ...markOptions});

  if (!values || !index || !dimensions) return null;

  const {value: V} = values;
  const {width: plotWidth, height: plotHeight, marginLeft, marginTop, marginRight, marginBottom} = dimensions;

  // Compute contours from gridded data
  const contourPaths = useMemo(() => {
    if (!V && !data) return [];

    const w = gridWidth ?? Math.ceil((plotWidth - marginLeft - marginRight) / pixelSize);
    const h = gridHeight ?? Math.ceil((plotHeight - marginTop - marginBottom) / pixelSize);

    // If data is a flat grid array
    let grid: number[];
    if (V) {
      grid = Array.from(index, (i) => +(V[i] ?? NaN));
    } else if (Array.isArray(data) && data.length === w * h) {
      grid = data.map(Number);
    } else {
      return [];
    }

    // Pad grid to required size
    if (grid.length < w * h) {
      grid = grid.concat(new Array(w * h - grid.length).fill(NaN));
    }

    const generator = d3Contours().size([w, h]);
    if (typeof thresholds === "number") generator.thresholds(thresholds);
    else if (Array.isArray(thresholds)) generator.thresholds(thresholds);
    if (smooth) generator.smooth(true);

    const result = generator(grid);

    // Scale the contour paths to plot coordinates
    const sx = (plotWidth - marginLeft - marginRight) / w;
    const sy = (plotHeight - marginTop - marginBottom) / h;
    const path = geoPath().projection({
      stream(s: any) {
        return {
          point(x: number, y: number) {
            s.point(marginLeft + x * sx, marginTop + y * sy);
          },
          lineStart() {
            s.lineStart();
          },
          lineEnd() {
            s.lineEnd();
          },
          polygonStart() {
            s.polygonStart();
          },
          polygonEnd() {
            s.polygonEnd();
          },
          sphere() {}
        };
      }
    });

    return result.map((c: any) => ({d: path(c), value: c.value}));
  }, [
    V,
    data,
    index,
    gridWidth,
    gridHeight,
    plotWidth,
    plotHeight,
    marginLeft,
    marginTop,
    marginRight,
    marginBottom,
    pixelSize,
    thresholds,
    smooth
  ]);

  const groupProps = indirectStyleProps(markOptions, dimensions);

  return (
    <g {...groupProps}>
      {contourPaths.map(({d}: any, j: number) => {
        if (!d) return null;
        return <path key={j} d={d} {...directStyleProps(markOptions)} />;
      })}
    </g>
  );
}
