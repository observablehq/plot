// @ts-nocheck — React components importing from untyped JS modules
import React, {useMemo} from "react";
import {useMark} from "../useMark.js";
import {indirectStyleProps, directStyleProps, channelStyleProps, computeTransform} from "../styles.js";
import type {ChannelSpec} from "../PlotContext.js";

const defaults = {
  ariaLabel: "tick",
  fill: null as any,
  stroke: "currentColor"
};

export interface TickProps {
  data?: any;
  x?: any;
  y?: any;
  fill?: any;
  stroke?: any;
  strokeWidth?: any;
  strokeOpacity?: any;
  opacity?: any;
  title?: any;
  tip?: any;
  dx?: number;
  dy?: number;
  inset?: number;
  insetTop?: number;
  insetBottom?: number;
  insetLeft?: number;
  insetRight?: number;
  className?: string;
  onClick?: (event: React.MouseEvent, datum: any) => void;
  [key: string]: any;
}

export function TickX({
  data,
  x,
  y,
  stroke,
  strokeWidth,
  strokeOpacity,
  opacity,
  title,
  tip,
  dx = 0,
  dy = 0,
  inset = 0,
  insetTop = inset,
  insetBottom = inset,
  className,
  onClick,
  ...restOptions
}: TickProps) {
  const channels: Record<string, ChannelSpec> = useMemo(
    () => ({
      x: {value: x, scale: "x"},
      y: {value: y, scale: "y", type: "band", optional: true},
      ...(typeof stroke === "string" && stroke !== "none" && stroke !== "currentColor" && !/^#|^rgb|^hsl/.test(stroke)
        ? {stroke: {value: stroke, scale: "auto", optional: true}}
        : {}),
      ...(typeof opacity === "string" || typeof opacity === "function"
        ? {opacity: {value: opacity, scale: "auto", optional: true}}
        : {}),
      ...(title != null ? {title: {value: title, optional: true, filter: null}} : {})
    }),
    [x, y, stroke, opacity, title]
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
      dx,
      dy,
      className
    }),
    [stroke, strokeWidth, dx, dy, className, restOptions]
  );

  const {values, index, scales, dimensions} = useMark({
    data,
    channels,
    ariaLabel: "x-tick",
    tip,
    ...markOptions
  });

  if (!values || !index || !dimensions || !scales) return null;

  const {x: X, y: Y} = values;
  const yBandwidth = scales.y?.bandwidth ? scales.y.bandwidth() : 0;

  const transform = computeTransform({dx, dy}, {x: scales.x});
  const groupProps = {
    ...indirectStyleProps(markOptions, dimensions),
    ...(transform ? {transform} : {})
  };

  return (
    <g {...groupProps}>
      {index.map((i) => {
        const xv = X[i];
        const yv = Y ? Y[i] : dimensions.marginTop;
        return (
          <line
            key={i}
            x1={xv}
            x2={xv}
            y1={yv + insetTop}
            y2={yv + yBandwidth - insetBottom}
            {...directStyleProps(markOptions)}
            {...channelStyleProps(i, values)}
            onClick={onClick ? (e) => onClick(e, data?.[i]) : undefined}
          >
            {values.title && values.title[i] != null && <title>{`${values.title[i]}`}</title>}
          </line>
        );
      })}
    </g>
  );
}

export function TickY({
  data,
  x,
  y,
  stroke,
  strokeWidth,
  strokeOpacity,
  opacity,
  title,
  tip,
  dx = 0,
  dy = 0,
  inset = 0,
  insetLeft = inset,
  insetRight = inset,
  className,
  onClick,
  ...restOptions
}: TickProps) {
  const channels: Record<string, ChannelSpec> = useMemo(
    () => ({
      y: {value: y, scale: "y"},
      x: {value: x, scale: "x", type: "band", optional: true},
      ...(typeof stroke === "string" && stroke !== "none" && stroke !== "currentColor" && !/^#|^rgb|^hsl/.test(stroke)
        ? {stroke: {value: stroke, scale: "auto", optional: true}}
        : {}),
      ...(typeof opacity === "string" || typeof opacity === "function"
        ? {opacity: {value: opacity, scale: "auto", optional: true}}
        : {}),
      ...(title != null ? {title: {value: title, optional: true, filter: null}} : {})
    }),
    [x, y, stroke, opacity, title]
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
      dx,
      dy,
      className
    }),
    [stroke, strokeWidth, dx, dy, className, restOptions]
  );

  const {values, index, scales, dimensions} = useMark({
    data,
    channels,
    ariaLabel: "y-tick",
    tip,
    ...markOptions
  });

  if (!values || !index || !dimensions || !scales) return null;

  const {x: X, y: Y} = values;
  const xBandwidth = scales.x?.bandwidth ? scales.x.bandwidth() : 0;

  const transform = computeTransform({dx, dy}, {y: scales.y});
  const groupProps = {
    ...indirectStyleProps(markOptions, dimensions),
    ...(transform ? {transform} : {})
  };

  return (
    <g {...groupProps}>
      {index.map((i) => {
        const yv = Y[i];
        const xv = X ? X[i] : dimensions.marginLeft;
        return (
          <line
            key={i}
            x1={xv + insetLeft}
            x2={xv + xBandwidth - insetRight}
            y1={yv}
            y2={yv}
            {...directStyleProps(markOptions)}
            {...channelStyleProps(i, values)}
            onClick={onClick ? (e) => onClick(e, data?.[i]) : undefined}
          >
            {values.title && values.title[i] != null && <title>{`${values.title[i]}`}</title>}
          </line>
        );
      })}
    </g>
  );
}
