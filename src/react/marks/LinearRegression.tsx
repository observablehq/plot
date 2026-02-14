// @ts-nocheck — React components importing from untyped JS modules
import React, {useMemo} from "react";
import {useMark} from "../useMark.js";
import {indirectStyleProps, computeTransform} from "../styles.js";
import type {ChannelSpec} from "../PlotContext.js";

const defaults = {
  ariaLabel: "linear-regression",
  fill: "currentColor",
  fillOpacity: 0.1,
  stroke: "currentColor",
  strokeWidth: 1.5
};

export interface LinearRegressionProps {
  data?: any;
  x?: any;
  y?: any;
  z?: any;
  fill?: any;
  fillOpacity?: number;
  stroke?: any;
  strokeWidth?: any;
  strokeOpacity?: any;
  ci?: number;
  precision?: number;
  className?: string;
  [key: string]: any;
}

// Compute simple linear regression: y = mx + b
function linearRegression(X: number[], Y: number[], index: number[]) {
  const n = index.length;
  if (n < 2) return null;
  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumX2 = 0;
  for (const i of index) {
    const xi = X[i],
      yi = Y[i];
    if (xi == null || yi == null || !isFinite(xi) || !isFinite(yi)) continue;
    sumX += xi;
    sumY += yi;
    sumXY += xi * yi;
    sumX2 += xi * xi;
  }
  const denom = n * sumX2 - sumX * sumX;
  if (Math.abs(denom) < 1e-10) return null;
  const m = (n * sumXY - sumX * sumY) / denom;
  const b = (sumY - m * sumX) / n;
  return {m, b, n, sumX, sumY, sumX2, sumXY};
}

export function LinearRegressionY({
  data,
  x,
  y,
  z,
  fill,
  fillOpacity = defaults.fillOpacity,
  stroke,
  strokeWidth,
  strokeOpacity,
  className,
  ...restOptions
}: LinearRegressionProps) {
  const channels: Record<string, ChannelSpec> = useMemo(
    () => ({
      x: {value: x, scale: "x"},
      y: {value: y, scale: "y"},
      ...(z != null ? {z: {value: z, optional: true}} : {}),
      ...(typeof stroke === "string" && stroke !== "none" && stroke !== "currentColor" && !/^#|^rgb|^hsl/.test(stroke)
        ? {stroke: {value: stroke, scale: "auto", optional: true}}
        : {})
    }),
    [x, y, z, stroke]
  );

  const markOptions = useMemo(
    () => ({
      ...defaults,
      ...restOptions,
      fill: typeof fill === "string" ? fill : defaults.fill,
      fillOpacity,
      stroke:
        typeof stroke === "string" && (stroke === "none" || stroke === "currentColor" || /^#|^rgb|^hsl/.test(stroke))
          ? stroke
          : defaults.stroke,
      strokeWidth: typeof strokeWidth === "number" ? strokeWidth : defaults.strokeWidth,
      className
    }),
    [fill, fillOpacity, stroke, strokeWidth, className, restOptions]
  );

  const {values, index, scales, dimensions} = useMark({data, channels, ariaLabel: defaults.ariaLabel, ...markOptions});

  if (!values || !index || !dimensions) return null;

  const {x: X, y: Y} = values;
  const {marginLeft, width, marginRight} = dimensions;

  const reg = useMemo(() => linearRegression(X, Y, index), [X, Y, index]);
  if (!reg) return null;

  const x1 = marginLeft;
  const x2 = width - marginRight;
  const y1v = reg.m * x1 + reg.b;
  const y2v = reg.m * x2 + reg.b;

  const transform = computeTransform({}, scales ?? {});
  const groupProps = {
    ...indirectStyleProps(markOptions, dimensions),
    ...(transform ? {transform} : {})
  };

  return (
    <g {...groupProps}>
      {/* Regression line */}
      <line
        x1={x1}
        y1={y1v}
        x2={x2}
        y2={y2v}
        fill="none"
        stroke={markOptions.stroke}
        strokeWidth={markOptions.strokeWidth}
        strokeOpacity={strokeOpacity}
      />
    </g>
  );
}

export function LinearRegressionX({
  data,
  x,
  y,
  z,
  fill,
  fillOpacity = defaults.fillOpacity,
  stroke,
  strokeWidth,
  strokeOpacity,
  className,
  ...restOptions
}: LinearRegressionProps) {
  const channels: Record<string, ChannelSpec> = useMemo(
    () => ({
      x: {value: x, scale: "x"},
      y: {value: y, scale: "y"},
      ...(z != null ? {z: {value: z, optional: true}} : {}),
      ...(typeof stroke === "string" && stroke !== "none" && stroke !== "currentColor" && !/^#|^rgb|^hsl/.test(stroke)
        ? {stroke: {value: stroke, scale: "auto", optional: true}}
        : {})
    }),
    [x, y, z, stroke]
  );

  const markOptions = useMemo(
    () => ({
      ...defaults,
      ...restOptions,
      fill: typeof fill === "string" ? fill : defaults.fill,
      fillOpacity,
      stroke:
        typeof stroke === "string" && (stroke === "none" || stroke === "currentColor" || /^#|^rgb|^hsl/.test(stroke))
          ? stroke
          : defaults.stroke,
      strokeWidth: typeof strokeWidth === "number" ? strokeWidth : defaults.strokeWidth,
      className
    }),
    [fill, fillOpacity, stroke, strokeWidth, className, restOptions]
  );

  const {values, index, scales, dimensions} = useMark({data, channels, ariaLabel: defaults.ariaLabel, ...markOptions});

  if (!values || !index || !dimensions) return null;

  const {x: X, y: Y} = values;
  const {marginTop, height, marginBottom} = dimensions;

  // LinearRegressionX: regress x on y (horizontal regression)
  const reg = useMemo(() => linearRegression(Y, X, index), [X, Y, index]);
  if (!reg) return null;

  const y1 = marginTop;
  const y2 = height - marginBottom;
  const x1v = reg.m * y1 + reg.b;
  const x2v = reg.m * y2 + reg.b;

  const transform = computeTransform({}, scales ?? {});
  const groupProps = {
    ...indirectStyleProps(markOptions, dimensions),
    ...(transform ? {transform} : {})
  };

  return (
    <g {...groupProps}>
      <line
        x1={x1v}
        y1={y1}
        x2={x2v}
        y2={y2}
        fill="none"
        stroke={markOptions.stroke}
        strokeWidth={markOptions.strokeWidth}
        strokeOpacity={strokeOpacity}
      />
    </g>
  );
}
