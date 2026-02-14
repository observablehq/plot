import React, {useMemo} from "react";
import {useMark} from "../useMark.js";
import {indirectStyleProps, directStyleProps, channelStyleProps} from "../styles.js";
import type {ChannelSpec} from "../PlotContext.js";

const defaults = {
  ariaLabel: "rect"
};

export interface RectProps {
  data?: any;
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
  onClick?: (event: React.MouseEvent, datum: any) => void;
  onPointerEnter?: (event: React.PointerEvent, datum: any) => void;
  onPointerLeave?: (event: React.PointerEvent, datum: any) => void;
  [key: string]: any;
}

export function Rect({
  data,
  x1,
  x2,
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
  onClick,
  onPointerEnter,
  onPointerLeave,
  ...restOptions
}: RectProps) {
  const channels: Record<string, ChannelSpec> = useMemo(
    () => ({
      x1: {value: x1, scale: "x", optional: true},
      x2: {value: x2, scale: "x", optional: true},
      y1: {value: y1, scale: "y", optional: true},
      y2: {value: y2, scale: "y", optional: true},
      ...(typeof fill === "string" && fill !== "none" && fill !== "currentColor" && !/^#|^rgb|^hsl/.test(fill)
        ? {fill: {value: fill, scale: "auto", optional: true}}
        : {}),
      ...(typeof stroke === "string" && stroke !== "none" && stroke !== "currentColor" && !/^#|^rgb|^hsl/.test(stroke)
        ? {stroke: {value: stroke, scale: "auto", optional: true}}
        : {}),
      ...(typeof fillOpacity === "string" || typeof fillOpacity === "function"
        ? {fillOpacity: {value: fillOpacity, scale: "auto", optional: true}}
        : {}),
      ...(typeof opacity === "string" || typeof opacity === "function"
        ? {opacity: {value: opacity, scale: "auto", optional: true}}
        : {}),
      ...(title != null ? {title: {value: title, optional: true, filter: null}} : {}),
      ...(href != null ? {href: {value: href, optional: true, filter: null}} : {})
    }),
    [x1, x2, y1, y2, fill, stroke, fillOpacity, opacity, title, href]
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

  const {x1: X1, x2: X2, y1: Y1, y2: Y2} = values;
  const {marginLeft, marginTop, width, height, marginRight, marginBottom} = dimensions;

  const groupProps = indirectStyleProps(markOptions, dimensions);

  return (
    <g {...groupProps}>
      {index.map((i) => {
        const x1v = X1 ? X1[i] : marginLeft;
        const x2v = X2 ? X2[i] : width - marginRight;
        const y1v = Y1 ? Y1[i] : marginTop;
        const y2v = Y2 ? Y2[i] : height - marginBottom;
        const xMin = Math.min(x1v, x2v) + insetLeft;
        const xMax = Math.max(x1v, x2v) - insetRight;
        const yMin = Math.min(y1v, y2v) + insetTop;
        const yMax = Math.max(y1v, y2v) - insetBottom;
        const w = Math.max(0, xMax - xMin);
        const h = Math.max(0, yMax - yMin);

        const chStyles = channelStyleProps(i, values);
        const dStyles = directStyleProps(markOptions);

        return (
          <rect
            key={i}
            x={xMin}
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

// Cell is a Rect with band x and y scales
export function Cell(props: RectProps) {
  return <Rect {...props} />;
}

// CellX: like Cell, but x defaults to the zero-based index and fill defaults to identity
export function CellX(props: RectProps) {
  const {x1 = (_d: any, i: number) => i, fill = (d: any) => d, ...rest} = props;
  return <Rect x1={x1} fill={fill} {...rest} />;
}

// CellY: like Cell, but y defaults to the zero-based index and fill defaults to identity
export function CellY(props: RectProps) {
  const {y1 = (_d: any, i: number) => i, fill = (d: any) => d, ...rest} = props;
  return <Rect y1={y1} fill={fill} {...rest} />;
}

// RectX: like Rect, but with y defaulting to index and x2 defaulting to identity
export function RectX(props: RectProps) {
  const {y1 = (_d: any, i: number) => i, x2 = (d: any) => d, ...rest} = props;
  return <Rect y1={y1} x2={x2} {...rest} />;
}

// RectY: like Rect, but with x defaulting to index and y2 defaulting to identity
export function RectY(props: RectProps) {
  const {x1 = (_d: any, i: number) => i, y2 = (d: any) => d, ...rest} = props;
  return <Rect x1={x1} y2={y2} {...rest} />;
}
