import React, {useMemo} from "react";
import {useMark} from "../useMark.js";
import {indirectStyleProps, directStyleProps, channelStyleProps, computeTransform} from "../styles.js";
import type {ChannelSpec} from "../PlotContext.js";

const defaults = {
  ariaLabel: "rule",
  fill: null as any,
  stroke: "currentColor"
};

export interface RuleProps {
  data?: any;
  x?: any;
  y?: any;
  x1?: any;
  x2?: any;
  y1?: any;
  y2?: any;
  fill?: any;
  stroke?: any;
  strokeWidth?: any;
  strokeOpacity?: any;
  strokeDasharray?: any;
  opacity?: any;
  title?: any;
  tip?: any;
  dx?: number;
  dy?: number;
  className?: string;
  [key: string]: any;
}

export function RuleX({
  data,
  x,
  y1,
  y2,
  stroke,
  strokeWidth,
  strokeOpacity,
  strokeDasharray,
  opacity,
  title,
  tip,
  dx = 0,
  dy = 0,
  className,
  ...restOptions
}: RuleProps) {
  const channels: Record<string, ChannelSpec> = useMemo(
    () => ({
      x: {value: x, scale: "x"},
      ...(y1 != null ? {y1: {value: y1, scale: "y", optional: true}} : {}),
      ...(y2 != null ? {y2: {value: y2, scale: "y", optional: true}} : {}),
      ...(typeof stroke === "string" && stroke !== "none" && stroke !== "currentColor" && !/^#|^rgb|^hsl/.test(stroke)
        ? {stroke: {value: stroke, scale: "auto", optional: true}}
        : {}),
      ...(typeof strokeOpacity === "string" || typeof strokeOpacity === "function"
        ? {strokeOpacity: {value: strokeOpacity, scale: "auto", optional: true}}
        : {}),
      ...(typeof opacity === "string" || typeof opacity === "function"
        ? {opacity: {value: opacity, scale: "auto", optional: true}}
        : {}),
      ...(title != null ? {title: {value: title, optional: true, filter: null}} : {})
    }),
    [x, y1, y2, stroke, strokeOpacity, opacity, title]
  );

  const markOptions = useMemo(
    () => ({
      ...defaults,
      ...restOptions,
      stroke:
        typeof stroke === "string" && (stroke === "none" || stroke === "currentColor" || /^#|^rgb|^hsl/.test(stroke))
          ? stroke
          : defaults.stroke,
      strokeWidth: typeof strokeWidth === "number" ? strokeWidth : undefined,
      strokeDasharray,
      dx,
      dy,
      className
    }),
    [stroke, strokeWidth, strokeDasharray, dx, dy, className, restOptions]
  );

  const {values, index, scales, dimensions} = useMark({
    data,
    channels,
    ariaLabel: "x-rule",
    tip,
    ...markOptions
  });

  if (!values || !index || !dimensions || !scales) return null;

  const {x: X, y1: Y1, y2: Y2} = values;
  const {marginTop, height, marginBottom} = dimensions;

  const transform = computeTransform({dx, dy}, {x: scales.x});
  const groupProps = {
    ...indirectStyleProps(markOptions, dimensions),
    ...(transform ? {transform} : {})
  };

  return (
    <g {...groupProps}>
      {index.map((i) => {
        const xv = X[i];
        const y1v = Y1 ? Y1[i] : marginTop;
        const y2v = Y2 ? Y2[i] : height - marginBottom;

        return (
          <line
            key={i}
            x1={xv}
            x2={xv}
            y1={y1v}
            y2={y2v}
            {...directStyleProps(markOptions)}
            {...channelStyleProps(i, values)}
          >
            {values.title && values.title[i] != null && <title>{`${values.title[i]}`}</title>}
          </line>
        );
      })}
    </g>
  );
}

export function RuleY({
  data,
  y,
  x1,
  x2,
  stroke,
  strokeWidth,
  strokeOpacity,
  strokeDasharray,
  opacity,
  title,
  tip,
  dx = 0,
  dy = 0,
  className,
  ...restOptions
}: RuleProps) {
  const channels: Record<string, ChannelSpec> = useMemo(
    () => ({
      y: {value: y, scale: "y"},
      ...(x1 != null ? {x1: {value: x1, scale: "x", optional: true}} : {}),
      ...(x2 != null ? {x2: {value: x2, scale: "x", optional: true}} : {}),
      ...(typeof stroke === "string" && stroke !== "none" && stroke !== "currentColor" && !/^#|^rgb|^hsl/.test(stroke)
        ? {stroke: {value: stroke, scale: "auto", optional: true}}
        : {}),
      ...(typeof strokeOpacity === "string" || typeof strokeOpacity === "function"
        ? {strokeOpacity: {value: strokeOpacity, scale: "auto", optional: true}}
        : {}),
      ...(typeof opacity === "string" || typeof opacity === "function"
        ? {opacity: {value: opacity, scale: "auto", optional: true}}
        : {}),
      ...(title != null ? {title: {value: title, optional: true, filter: null}} : {})
    }),
    [y, x1, x2, stroke, strokeOpacity, opacity, title]
  );

  const markOptions = useMemo(
    () => ({
      ...defaults,
      ...restOptions,
      stroke:
        typeof stroke === "string" && (stroke === "none" || stroke === "currentColor" || /^#|^rgb|^hsl/.test(stroke))
          ? stroke
          : defaults.stroke,
      strokeWidth: typeof strokeWidth === "number" ? strokeWidth : undefined,
      strokeDasharray,
      dx,
      dy,
      className
    }),
    [stroke, strokeWidth, strokeDasharray, dx, dy, className, restOptions]
  );

  const {values, index, scales, dimensions} = useMark({
    data,
    channels,
    ariaLabel: "y-rule",
    tip,
    ...markOptions
  });

  if (!values || !index || !dimensions || !scales) return null;

  const {y: Y, x1: X1, x2: X2} = values;
  const {marginLeft, width, marginRight} = dimensions;

  const transform = computeTransform({dx, dy}, {y: scales.y});
  const groupProps = {
    ...indirectStyleProps(markOptions, dimensions),
    ...(transform ? {transform} : {})
  };

  return (
    <g {...groupProps}>
      {index.map((i) => {
        const yv = Y[i];
        const x1v = X1 ? X1[i] : marginLeft;
        const x2v = X2 ? X2[i] : width - marginRight;

        return (
          <line
            key={i}
            x1={x1v}
            x2={x2v}
            y1={yv}
            y2={yv}
            {...directStyleProps(markOptions)}
            {...channelStyleProps(i, values)}
          >
            {values.title && values.title[i] != null && <title>{`${values.title[i]}`}</title>}
          </line>
        );
      })}
    </g>
  );
}
