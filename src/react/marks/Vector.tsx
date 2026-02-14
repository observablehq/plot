// @ts-nocheck — React components importing from untyped JS modules
import React, {useMemo} from "react";
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
  ariaLabel: "vector",
  fill: null as any,
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round"
};

export interface VectorProps {
  data?: any;
  x?: any;
  y?: any;
  length?: any;
  rotate?: any;
  fill?: any;
  stroke?: any;
  strokeWidth?: any;
  strokeOpacity?: any;
  opacity?: any;
  title?: any;
  tip?: any;
  dx?: number;
  dy?: number;
  anchor?: "start" | "middle" | "end";
  shape?: string;
  frameAnchor?: string;
  className?: string;
  [key: string]: any;
}

export function Vector({
  data,
  x,
  y,
  length: lengthProp,
  rotate: rotateProp,
  stroke,
  strokeWidth,
  strokeOpacity,
  opacity,
  title,
  tip,
  dx = 0,
  dy = 0,
  anchor = "middle",
  frameAnchor,
  className,
  ...restOptions
}: VectorProps) {
  const isLengthChannel =
    lengthProp != null &&
    (typeof lengthProp === "string" || typeof lengthProp === "function" || Array.isArray(lengthProp));
  const isRotateChannel =
    rotateProp != null &&
    (typeof rotateProp === "string" || typeof rotateProp === "function" || Array.isArray(rotateProp));

  const channels: Record<string, ChannelSpec> = useMemo(
    () => ({
      x: {value: x, scale: "x", optional: true},
      y: {value: y, scale: "y", optional: true},
      ...(isLengthChannel ? {length: {value: lengthProp, scale: "length", optional: true}} : {}),
      ...(isRotateChannel ? {rotate: {value: rotateProp, optional: true}} : {}),
      ...(typeof stroke === "string" && stroke !== "none" && stroke !== "currentColor" && !/^#|^rgb|^hsl/.test(stroke)
        ? {stroke: {value: stroke, scale: "auto", optional: true}}
        : {}),
      ...(typeof opacity === "string" || typeof opacity === "function"
        ? {opacity: {value: opacity, scale: "auto", optional: true}}
        : {}),
      ...(title != null ? {title: {value: title, optional: true, filter: null}} : {})
    }),
    [x, y, lengthProp, rotateProp, stroke, opacity, title, isLengthChannel, isRotateChannel]
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
      className,
      frameAnchor
    }),
    [stroke, strokeWidth, dx, dy, className, frameAnchor, restOptions]
  );

  const {values, index, scales, dimensions} = useMark({
    data,
    channels,
    ariaLabel: defaults.ariaLabel,
    tip,
    ...markOptions
  });

  if (!values || !index || !dimensions || !scales) return null;

  const {x: X, y: Y, length: L, rotate: A} = values;
  const [anchorX, anchorY] = computeFrameAnchor(frameAnchor, dimensions);
  const constantLength = isLengthChannel ? undefined : typeof lengthProp === "number" ? lengthProp : 12;
  const constantRotate = isRotateChannel ? undefined : typeof rotateProp === "number" ? rotateProp : 0;

  const transform = computeTransform({dx, dy}, scales);
  const groupProps = {
    ...indirectStyleProps(markOptions, dimensions),
    ...(transform ? {transform} : {})
  };

  return (
    <g {...groupProps}>
      {index.map((i) => {
        const cx = X ? X[i] : anchorX;
        const cy = Y ? Y[i] : anchorY;
        const len = L ? L[i] : constantLength;
        const angle = A ? A[i] : constantRotate;

        // Compute the vector path based on anchor
        const offset = anchor === "start" ? 0 : anchor === "end" ? -len : -len / 2;

        return (
          <line
            key={i}
            x1={0}
            y1={offset}
            x2={0}
            y2={offset + len}
            transform={`translate(${cx},${cy}) rotate(${angle})`}
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

// VectorX: like Vector, but x defaults to identity
export function VectorX(props: VectorProps) {
  const {x = (d: any) => d, ...rest} = props;
  return <Vector x={x} {...rest} />;
}

// VectorY: like Vector, but y defaults to identity
export function VectorY(props: VectorProps) {
  const {y = (d: any) => d, ...rest} = props;
  return <Vector y={y} {...rest} />;
}

export function Spike(props: VectorProps) {
  return <Vector shape="spike" anchor="start" {...props} />;
}
