// @ts-nocheck — React components importing from untyped JS modules
import React, {useMemo} from "react";
import {useMark} from "../useMark.js";
import {indirectStyleProps, directStyleProps, channelStyleProps, computeTransform} from "../styles.js";
import type {ChannelSpec} from "../PlotContext.js";

const defaults = {
  ariaLabel: "link",
  fill: "none" as any,
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeMiterlimit: 1
};

export interface LinkProps {
  data?: any;
  x1?: any;
  y1?: any;
  x2?: any;
  y2?: any;
  fill?: any;
  stroke?: any;
  strokeWidth?: any;
  strokeOpacity?: any;
  opacity?: any;
  title?: any;
  tip?: any;
  dx?: number;
  dy?: number;
  curve?: any;
  tension?: number;
  className?: string;
  onClick?: (event: React.MouseEvent, datum: any) => void;
  [key: string]: any;
}

export function Link({
  data,
  x1,
  y1,
  x2,
  y2,
  stroke,
  strokeWidth,
  strokeOpacity,
  opacity,
  title,
  tip,
  dx = 0,
  dy = 0,
  curve: curveProp,
  tension,
  className,
  onClick,
  ...restOptions
}: LinkProps) {
  const channels: Record<string, ChannelSpec> = useMemo(
    () => ({
      x1: {value: x1, scale: "x"},
      y1: {value: y1, scale: "y"},
      x2: {value: x2, scale: "x"},
      y2: {value: y2, scale: "y"},
      ...(typeof stroke === "string" && stroke !== "none" && stroke !== "currentColor" && !/^#|^rgb|^hsl/.test(stroke)
        ? {stroke: {value: stroke, scale: "auto", optional: true}}
        : {}),
      ...(typeof opacity === "string" || typeof opacity === "function"
        ? {opacity: {value: opacity, scale: "auto", optional: true}}
        : {}),
      ...(title != null ? {title: {value: title, optional: true, filter: null}} : {})
    }),
    [x1, y1, x2, y2, stroke, opacity, title]
  );

  const markOptions = useMemo(
    () => ({
      ...defaults,
      ...restOptions,
      stroke:
        typeof stroke === "string" && (stroke === "none" || stroke === "currentColor" || /^#|^rgb|^hsl/.test(stroke))
          ? stroke
          : defaults.stroke,
      strokeWidth: typeof strokeWidth === "number" ? strokeWidth : defaults.strokeWidth,
      dx,
      dy,
      className
    }),
    [stroke, strokeWidth, dx, dy, className, restOptions]
  );

  const {values, index, scales, dimensions} = useMark({
    data,
    channels,
    ariaLabel: defaults.ariaLabel,
    tip,
    ...markOptions
  });

  if (!values || !index || !dimensions || !scales) return null;

  const {x1: X1, y1: Y1, x2: X2, y2: Y2} = values;

  const transform = computeTransform({dx, dy}, scales);
  const groupProps = {
    ...indirectStyleProps(markOptions, dimensions),
    ...(transform ? {transform} : {})
  };

  return (
    <g {...groupProps}>
      {index.map((i) => (
        <line
          key={i}
          x1={X1[i]}
          y1={Y1[i]}
          x2={X2[i]}
          y2={Y2[i]}
          {...directStyleProps(markOptions)}
          {...channelStyleProps(i, values)}
          onClick={onClick ? (e) => onClick(e, data?.[i]) : undefined}
        >
          {values.title && values.title[i] != null && <title>{`${values.title[i]}`}</title>}
        </line>
      ))}
    </g>
  );
}
