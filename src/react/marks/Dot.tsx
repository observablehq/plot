// @ts-nocheck — React components importing from untyped JS modules
import React, {useMemo} from "react";
import {pathRound as path, symbolCircle} from "d3";
import {useMark} from "../useMark.js";
import {
  indirectStyleProps,
  directStyleProps,
  channelStyleProps,
  computeTransform,
  computeFrameAnchor
} from "../styles.js";
import type {ChannelSpec} from "../PlotContext.js";

const defaults = {
  ariaLabel: "dot",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5
};

export interface DotProps {
  data?: any;
  x?: any;
  y?: any;
  r?: any;
  rotate?: any;
  symbol?: any;
  fill?: any;
  stroke?: any;
  fillOpacity?: any;
  strokeOpacity?: any;
  strokeWidth?: any;
  opacity?: any;
  title?: any;
  href?: any;
  frameAnchor?: string;
  tip?: any;
  dx?: number;
  dy?: number;
  className?: string;
  render?: (index: number[], scales: any, values: any, dimensions: any) => React.ReactNode;
  onClick?: (event: React.MouseEvent, datum: any) => void;
  onPointerEnter?: (event: React.PointerEvent, datum: any) => void;
  onPointerLeave?: (event: React.PointerEvent, datum: any) => void;
  [key: string]: any;
}

export function Dot({
  data,
  x,
  y,
  r,
  rotate,
  symbol = symbolCircle,
  fill,
  stroke,
  fillOpacity,
  strokeOpacity,
  strokeWidth,
  opacity,
  title,
  href,
  frameAnchor,
  tip,
  dx = 0,
  dy = 0,
  className,
  render: customRender,
  onClick,
  onPointerEnter,
  onPointerLeave,
  ...restOptions
}: DotProps) {
  // Determine whether r, rotate, symbol are channels or constants
  const isRChannel = r != null && (typeof r === "string" || typeof r === "function" || Array.isArray(r));
  const isRotateChannel =
    rotate != null && (typeof rotate === "string" || typeof rotate === "function" || Array.isArray(rotate));
  const isSymbolChannel =
    symbol != null &&
    typeof symbol !== "object" &&
    ((typeof symbol === "string" && symbol !== "circle" && symbol !== "hexagon") ||
      typeof symbol === "function" ||
      Array.isArray(symbol));

  const channels: Record<string, ChannelSpec> = useMemo(
    () => ({
      x: {value: x, scale: "x", optional: true},
      y: {value: y, scale: "y", optional: true},
      ...(isRChannel ? {r: {value: r, scale: "r", optional: true}} : {}),
      ...(isRotateChannel ? {rotate: {value: rotate, optional: true}} : {}),
      ...(isSymbolChannel ? {symbol: {value: symbol, scale: "auto", optional: true}} : {}),
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
    [
      x,
      y,
      r,
      rotate,
      symbol,
      fill,
      stroke,
      fillOpacity,
      strokeOpacity,
      opacity,
      title,
      href,
      isRChannel,
      isRotateChannel,
      isSymbolChannel
    ]
  );

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
      className,
      frameAnchor
    }),
    [fill, stroke, strokeWidth, dx, dy, className, frameAnchor, restOptions]
  );

  const {values, index, scales, dimensions} = useMark({
    data,
    channels,
    ariaLabel: defaults.ariaLabel,
    tip,
    ...markOptions
  });

  // Registration phase — nothing to render yet
  if (!values || !index || !dimensions || !scales) return null;

  // Custom render function
  if (customRender) {
    return <>{customRender(index, scales, values, dimensions)}</>;
  }

  const {x: X, y: Y, r: R, rotate: A, symbol: S} = values;
  const [anchorX, anchorY] = computeFrameAnchor(frameAnchor, dimensions);
  const constantR = isRChannel ? undefined : typeof r === "number" ? r : 3;
  const constantRotate = isRotateChannel ? undefined : typeof rotate === "number" ? rotate : 0;
  const isCircle = symbol === symbolCircle || symbol === "circle";
  const size = constantR != null ? constantR * constantR * Math.PI : undefined;

  const transform = computeTransform({dx, dy}, {x: X && scales.x, y: Y && scales.y});

  const groupProps = {
    ...indirectStyleProps(markOptions, dimensions),
    ...(transform ? {transform} : {})
  };

  return (
    <g {...groupProps}>
      {index.map((i) => {
        const cx = X ? X[i] : anchorX;
        const cy = Y ? Y[i] : anchorY;
        const ri = R ? R[i] : constantR;
        const chStyles = channelStyleProps(i, values);
        const dStyles = directStyleProps(markOptions);

        if (isCircle && !A && !S) {
          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={ri}
              {...dStyles}
              {...chStyles}
              onClick={onClick ? (e) => onClick(e, data?.[i]) : undefined}
              onPointerEnter={onPointerEnter ? (e) => onPointerEnter(e, data?.[i]) : undefined}
              onPointerLeave={onPointerLeave ? (e) => onPointerLeave(e, data?.[i]) : undefined}
            >
              {values.title && values.title[i] != null && <title>{`${values.title[i]}`}</title>}
            </circle>
          );
        }

        // Non-circle symbols: use path
        const sym = S ? S[i] : typeof symbol === "object" ? symbol : symbolCircle;
        const s = R ? R[i] * R[i] * Math.PI : size;
        const p = path();
        sym.draw(p, s);
        const d = `${p}`;

        const rot = A ? A[i] : constantRotate;
        const t = `translate(${cx},${cy})${rot ? ` rotate(${rot})` : ""}`;

        return (
          <path
            key={i}
            transform={t}
            d={d}
            {...dStyles}
            {...chStyles}
            onClick={onClick ? (e) => onClick(e, data?.[i]) : undefined}
            onPointerEnter={onPointerEnter ? (e) => onPointerEnter(e, data?.[i]) : undefined}
            onPointerLeave={onPointerLeave ? (e) => onPointerLeave(e, data?.[i]) : undefined}
          >
            {values.title && values.title[i] != null && <title>{`${values.title[i]}`}</title>}
          </path>
        );
      })}
    </g>
  );
}

// Convenience variants
export function DotX(props: DotProps) {
  const {x = (d: any) => d, ...rest} = props;
  return <Dot x={x} {...rest} />;
}

export function DotY(props: DotProps) {
  const {y = (d: any) => d, ...rest} = props;
  return <Dot y={y} {...rest} />;
}

export function Circle(props: DotProps) {
  return <Dot {...props} symbol="circle" />;
}

export function Hexagon(props: DotProps) {
  return <Dot {...props} symbol="hexagon" />;
}
