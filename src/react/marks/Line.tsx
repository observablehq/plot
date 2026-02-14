// @ts-nocheck — React components importing from untyped JS modules
import React, {useMemo} from "react";
import {line as shapeLine, group, curveLinear} from "d3";
import {useMark} from "../useMark.js";
import {indirectStyleProps, directStyleProps, groupChannelStyleProps, computeTransform} from "../styles.js";
import {maybeCurveAuto} from "../../curve.js";
import type {ChannelSpec} from "../PlotContext.js";
import {defined} from "../../defined.js";

const defaults = {
  ariaLabel: "line",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  strokeMiterlimit: 1
};

export interface LineProps {
  data?: any;
  x?: any;
  y?: any;
  z?: any;
  fill?: any;
  stroke?: any;
  strokeWidth?: any;
  strokeOpacity?: any;
  opacity?: any;
  curve?: any;
  tension?: number;
  title?: any;
  tip?: any;
  dx?: number;
  dy?: number;
  className?: string;
  render?: (groups: number[][], scales: any, values: any, dimensions: any) => React.ReactNode;
  [key: string]: any;
}

export function Line({
  data,
  x,
  y,
  z,
  fill,
  stroke,
  strokeWidth,
  strokeOpacity,
  opacity,
  curve: curveProp,
  tension,
  title,
  tip,
  dx = 0,
  dy = 0,
  className,
  render: customRender,
  ...restOptions
}: LineProps) {
  // Determine z channel: defaults to fill or stroke if they're channels
  const maybeZ =
    z ??
    (typeof fill === "string" && !/^#|^rgb|^hsl|^none|^currentColor/.test(fill) ? fill : undefined) ??
    (typeof stroke === "string" && !/^#|^rgb|^hsl|^none|^currentColor/.test(stroke) ? stroke : undefined);

  const channels: Record<string, ChannelSpec> = useMemo(
    () => ({
      x: {value: x, scale: "x"},
      y: {value: y, scale: "y"},
      ...(maybeZ != null ? {z: {value: maybeZ, optional: true}} : {}),
      ...(typeof fill === "string" && fill !== "none" && fill !== "currentColor" && !/^#|^rgb|^hsl/.test(fill)
        ? {fill: {value: fill, scale: "auto", optional: true}}
        : {}),
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
    [x, y, maybeZ, fill, stroke, strokeOpacity, opacity, title]
  );

  const curveValue = useMemo(() => maybeCurveAuto(curveProp, tension), [curveProp, tension]);

  const markOptions = useMemo(
    () => ({
      ...defaults,
      ...restOptions,
      dx,
      dy,
      fill:
        typeof fill === "string" && (fill === "none" || fill === "currentColor" || /^#|^rgb|^hsl/.test(fill))
          ? fill
          : defaults.fill,
      stroke:
        typeof stroke === "string" && (stroke === "none" || stroke === "currentColor" || /^#|^rgb|^hsl/.test(stroke))
          ? stroke
          : defaults.stroke,
      strokeWidth: typeof strokeWidth === "number" ? strokeWidth : defaults.strokeWidth,
      className
    }),
    [fill, stroke, strokeWidth, dx, dy, className, restOptions]
  );

  const {values, index, scales, dimensions} = useMark({
    data,
    channels,
    ariaLabel: defaults.ariaLabel,
    tip,
    ...markOptions
  });

  if (!values || !index || !dimensions || !scales) return null;

  const {x: X, y: Y, z: Z} = values;

  // Group the index by z channel (if present), similar to groupIndex in style.js
  const groups = useMemo(() => {
    if (!index || !X || !Y) return [];
    if (Z) {
      const grouped = group(index, (i: number) => Z[i]);
      return Array.from(grouped.values());
    }
    return [index];
  }, [index, X, Y, Z]);

  if (customRender) {
    return <>{customRender(groups, scales, values, dimensions)}</>;
  }

  const lineGen = shapeLine<number>()
    .curve(curveValue ?? curveLinear)
    .defined((i: number) => i >= 0 && defined(X[i]) && defined(Y[i]))
    .x((i: number) => X[i])
    .y((i: number) => Y[i]);

  const transform = computeTransform({dx, dy}, scales);
  const groupProps = {
    ...indirectStyleProps(markOptions, dimensions),
    ...(transform ? {transform} : {})
  };

  return (
    <g {...groupProps}>
      {groups.map((g, j) => {
        const d = lineGen(g);
        if (!d) return null;
        const gStyles = groupChannelStyleProps(g, values);
        const dStyles = directStyleProps(markOptions);
        return (
          <path key={j} d={d} {...dStyles} {...gStyles}>
            {values.title && g[0] != null && values.title[g[0]] != null && <title>{`${values.title[g[0]]}`}</title>}
          </path>
        );
      })}
    </g>
  );
}

// Convenience variants
export function LineX(props: LineProps) {
  const {x = (d: any) => d, y = (d: any, i: number) => i, ...rest} = props;
  return <Line x={x} y={y} {...rest} />;
}

export function LineY(props: LineProps) {
  const {x = (d: any, i: number) => i, y = (d: any) => d, ...rest} = props;
  return <Line x={x} y={y} {...rest} />;
}
