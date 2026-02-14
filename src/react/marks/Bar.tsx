import React, {useMemo} from "react";
import {useMark} from "../useMark.js";
import {indirectStyleProps, directStyleProps, channelStyleProps, computeTransform} from "../styles.js";
import type {ChannelSpec} from "../PlotContext.js";

const defaults = {
  ariaLabel: "bar"
};

export interface BarProps {
  data?: any;
  x?: any;
  y?: any;
  x1?: any;
  x2?: any;
  y1?: any;
  y2?: any;
  fill?: any;
  stroke?: any;
  fillOpacity?: any;
  strokeOpacity?: any;
  strokeWidth?: any;
  opacity?: any;
  title?: any;
  href?: any;
  tip?: any;
  dx?: number;
  dy?: number;
  inset?: number;
  insetTop?: number;
  insetRight?: number;
  insetBottom?: number;
  insetLeft?: number;
  rx?: number;
  ry?: number;
  className?: string;
  render?: (index: number[], scales: any, values: any, dimensions: any) => React.ReactNode;
  onClick?: (event: React.MouseEvent, datum: any) => void;
  onPointerEnter?: (event: React.PointerEvent, datum: any) => void;
  onPointerLeave?: (event: React.PointerEvent, datum: any) => void;
  [key: string]: any;
}

export function BarX({
  data,
  x1,
  x2,
  y,
  fill,
  stroke,
  fillOpacity,
  strokeOpacity,
  strokeWidth,
  opacity,
  title,
  href,
  tip,
  dx = 0,
  dy = 0,
  inset = 0,
  insetTop = inset,
  insetRight = inset,
  insetBottom = inset,
  insetLeft = inset,
  rx,
  ry,
  className,
  render: customRender,
  onClick,
  onPointerEnter,
  onPointerLeave,
  ...restOptions
}: BarProps) {
  const channels: Record<string, ChannelSpec> = useMemo(
    () => ({
      x1: {value: x1, scale: "x"},
      x2: {value: x2, scale: "x"},
      y: {value: y, scale: "y", type: "band", optional: true},
      ...(typeof fill === "string" && fill !== "none" && fill !== "currentColor" && !/^#|^rgb|^hsl/.test(fill)
        ? {fill: {value: fill, scale: "auto", optional: true}}
        : {}),
      ...(typeof stroke === "string" && stroke !== "none" && stroke !== "currentColor" && !/^#|^rgb|^hsl/.test(stroke)
        ? {stroke: {value: stroke, scale: "auto", optional: true}}
        : {}),
      ...(typeof fillOpacity === "string" || typeof fillOpacity === "function"
        ? {fillOpacity: {value: fillOpacity, scale: "auto", optional: true}}
        : {}),
      ...(typeof strokeOpacity === "string" || typeof strokeOpacity === "function"
        ? {strokeOpacity: {value: strokeOpacity, scale: "auto", optional: true}}
        : {}),
      ...(typeof opacity === "string" || typeof opacity === "function"
        ? {opacity: {value: opacity, scale: "auto", optional: true}}
        : {}),
      ...(title != null ? {title: {value: title, optional: true, filter: null}} : {}),
      ...(href != null ? {href: {value: href, optional: true, filter: null}} : {})
    }),
    [x1, x2, y, fill, stroke, fillOpacity, strokeOpacity, opacity, title, href]
  );

  const markOptions = useMemo(
    () => ({
      ...defaults,
      ...restOptions,
      fill:
        typeof fill === "string" && (fill === "none" || fill === "currentColor" || /^#|^rgb|^hsl/.test(fill))
          ? fill
          : "currentColor",
      stroke: typeof stroke === "string" ? stroke : undefined,
      dx,
      dy,
      className
    }),
    [fill, stroke, dx, dy, className, restOptions]
  );

  const {values, index, scales, dimensions} = useMark({
    data,
    channels,
    ariaLabel: defaults.ariaLabel,
    tip,
    ...markOptions
  });

  if (!values || !index || !dimensions || !scales) return null;

  if (customRender) {
    return <>{customRender(index, scales, values, dimensions)}</>;
  }

  const {x1: X1, x2: X2, y: Y} = values;
  const {marginLeft, marginTop, width, height, marginRight, marginBottom} = dimensions;

  // Compute bandwidth for y if it's a band scale
  const yBandwidth = scales.y?.bandwidth ? scales.y.bandwidth() : height - marginTop - marginBottom;

  const transform = computeTransform({dx, dy}, {x: scales.x}, 0, 0);
  const groupProps = {
    ...indirectStyleProps(markOptions, dimensions),
    ...(transform ? {transform} : {})
  };

  return (
    <g {...groupProps}>
      {index.map((i) => {
        const x1v = X1 ? X1[i] : marginLeft;
        const x2v = X2 ? X2[i] : width - marginRight;
        const xMin = Math.min(x1v, x2v) + insetLeft;
        const xMax = Math.max(x1v, x2v) - insetRight;
        const yv = Y ? Y[i] + insetTop : marginTop + insetTop;
        const h = Math.max(0, yBandwidth - insetTop - insetBottom);
        const w = Math.max(0, xMax - xMin);

        const chStyles = channelStyleProps(i, values);
        const dStyles = directStyleProps(markOptions);

        return (
          <rect
            key={i}
            x={xMin}
            y={yv}
            width={w}
            height={h}
            rx={rx}
            ry={ry}
            {...dStyles}
            {...chStyles}
            onClick={onClick ? (e) => onClick(e, data?.[i]) : undefined}
            onPointerEnter={onPointerEnter ? (e) => onPointerEnter(e, data?.[i]) : undefined}
            onPointerLeave={onPointerLeave ? (e) => onPointerLeave(e, data?.[i]) : undefined}
          >
            {values.title && values.title[i] != null && <title>{`${values.title[i]}`}</title>}
          </rect>
        );
      })}
    </g>
  );
}

export function BarY({
  data,
  x,
  y1,
  y2,
  fill,
  stroke,
  fillOpacity,
  strokeOpacity,
  strokeWidth,
  opacity,
  title,
  href,
  tip,
  dx = 0,
  dy = 0,
  inset = 0,
  insetTop = inset,
  insetRight = inset,
  insetBottom = inset,
  insetLeft = inset,
  rx,
  ry,
  className,
  render: customRender,
  onClick,
  onPointerEnter,
  onPointerLeave,
  ...restOptions
}: BarProps) {
  const channels: Record<string, ChannelSpec> = useMemo(
    () => ({
      y1: {value: y1, scale: "y"},
      y2: {value: y2, scale: "y"},
      x: {value: x, scale: "x", type: "band", optional: true},
      ...(typeof fill === "string" && fill !== "none" && fill !== "currentColor" && !/^#|^rgb|^hsl/.test(fill)
        ? {fill: {value: fill, scale: "auto", optional: true}}
        : {}),
      ...(typeof stroke === "string" && stroke !== "none" && stroke !== "currentColor" && !/^#|^rgb|^hsl/.test(stroke)
        ? {stroke: {value: stroke, scale: "auto", optional: true}}
        : {}),
      ...(typeof fillOpacity === "string" || typeof fillOpacity === "function"
        ? {fillOpacity: {value: fillOpacity, scale: "auto", optional: true}}
        : {}),
      ...(typeof strokeOpacity === "string" || typeof strokeOpacity === "function"
        ? {strokeOpacity: {value: strokeOpacity, scale: "auto", optional: true}}
        : {}),
      ...(typeof opacity === "string" || typeof opacity === "function"
        ? {opacity: {value: opacity, scale: "auto", optional: true}}
        : {}),
      ...(title != null ? {title: {value: title, optional: true, filter: null}} : {}),
      ...(href != null ? {href: {value: href, optional: true, filter: null}} : {})
    }),
    [x, y1, y2, fill, stroke, fillOpacity, strokeOpacity, opacity, title, href]
  );

  const markOptions = useMemo(
    () => ({
      ...defaults,
      ...restOptions,
      fill:
        typeof fill === "string" && (fill === "none" || fill === "currentColor" || /^#|^rgb|^hsl/.test(fill))
          ? fill
          : "currentColor",
      stroke: typeof stroke === "string" ? stroke : undefined,
      dx,
      dy,
      className
    }),
    [fill, stroke, dx, dy, className, restOptions]
  );

  const {values, index, scales, dimensions} = useMark({
    data,
    channels,
    ariaLabel: defaults.ariaLabel,
    tip,
    ...markOptions
  });

  if (!values || !index || !dimensions || !scales) return null;

  if (customRender) {
    return <>{customRender(index, scales, values, dimensions)}</>;
  }

  const {x: X, y1: Y1, y2: Y2} = values;
  const {marginLeft, marginTop, width, height, marginRight, marginBottom} = dimensions;

  // Compute bandwidth for x if it's a band scale
  const xBandwidth = scales.x?.bandwidth ? scales.x.bandwidth() : width - marginLeft - marginRight;

  const transform = computeTransform({dx, dy}, {y: scales.y}, 0, 0);
  const groupProps = {
    ...indirectStyleProps(markOptions, dimensions),
    ...(transform ? {transform} : {})
  };

  return (
    <g {...groupProps}>
      {index.map((i) => {
        const y1v = Y1 ? Y1[i] : marginTop;
        const y2v = Y2 ? Y2[i] : height - marginBottom;
        const yMin = Math.min(y1v, y2v) + insetTop;
        const yMax = Math.max(y1v, y2v) - insetBottom;
        const xv = X ? X[i] + insetLeft : marginLeft + insetLeft;
        const w = Math.max(0, xBandwidth - insetLeft - insetRight);
        const h = Math.max(0, yMax - yMin);

        const chStyles = channelStyleProps(i, values);
        const dStyles = directStyleProps(markOptions);

        return (
          <rect
            key={i}
            x={xv}
            y={yMin}
            width={w}
            height={h}
            rx={rx}
            ry={ry}
            {...dStyles}
            {...chStyles}
            onClick={onClick ? (e) => onClick(e, data?.[i]) : undefined}
            onPointerEnter={onPointerEnter ? (e) => onPointerEnter(e, data?.[i]) : undefined}
            onPointerLeave={onPointerLeave ? (e) => onPointerLeave(e, data?.[i]) : undefined}
          >
            {values.title && values.title[i] != null && <title>{`${values.title[i]}`}</title>}
          </rect>
        );
      })}
    </g>
  );
}
