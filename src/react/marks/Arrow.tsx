// @ts-nocheck — React components importing from untyped JS modules
import React, {useMemo} from "react";
import {useMark} from "../useMark.js";
import {indirectStyleProps, directStyleProps, channelStyleProps, computeTransform} from "../styles.js";
import type {ChannelSpec} from "../PlotContext.js";

const defaults = {
  ariaLabel: "arrow",
  fill: "none" as any,
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeMiterlimit: 1
};

export interface ArrowProps {
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
  bend?: number;
  headAngle?: number;
  headLength?: number;
  inset?: number;
  insetStart?: number;
  insetEnd?: number;
  sweep?: number | string;
  className?: string;
  onClick?: (event: React.MouseEvent, datum: any) => void;
  [key: string]: any;
}

export function Arrow({
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
  bend = 0,
  headAngle = 60,
  headLength = 8,
  inset = 0,
  insetStart = inset,
  insetEnd = inset,
  sweep,
  className,
  onClick,
  ...restOptions
}: ArrowProps) {
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
  const halfAngle = (headAngle * Math.PI) / 360;

  const transform = computeTransform({dx, dy}, scales);
  const groupProps = {
    ...indirectStyleProps(markOptions, dimensions),
    ...(transform ? {transform} : {})
  };

  return (
    <g {...groupProps}>
      {index.map((i) => {
        let px1 = X1[i],
          py1 = Y1[i],
          px2 = X2[i],
          py2 = Y2[i];
        const ddx = px2 - px1,
          ddy = py2 - py1;
        const length = Math.hypot(ddx, ddy);
        if (length < insetStart + insetEnd) return null;

        // Apply insets
        if (insetStart || insetEnd) {
          const ratio1 = insetStart / length;
          const ratio2 = insetEnd / length;
          px1 += ddx * ratio1;
          py1 += ddy * ratio1;
          px2 -= ddx * ratio2;
          py2 -= ddy * ratio2;
        }

        // Arrow head
        const angle = Math.atan2(ddy, ddx);
        const hx1 = px2 - headLength * Math.cos(angle - halfAngle);
        const hy1 = py2 - headLength * Math.sin(angle - halfAngle);
        const hx2 = px2 - headLength * Math.cos(angle + halfAngle);
        const hy2 = py2 - headLength * Math.sin(angle + halfAngle);

        const d = bend
          ? `M${px1},${py1}Q${(px1 + px2) / 2 + bend},${(py1 + py2) / 2 + bend},${px2},${py2}`
          : `M${px1},${py1}L${px2},${py2}`;

        return (
          <g key={i} onClick={onClick ? (e) => onClick(e, data?.[i]) : undefined}>
            <path d={d} {...directStyleProps(markOptions)} {...channelStyleProps(i, values)} />
            <path d={`M${hx1},${hy1}L${px2},${py2}L${hx2},${hy2}`} fill="none" {...channelStyleProps(i, values)} />
            {values.title && values.title[i] != null && <title>{`${values.title[i]}`}</title>}
          </g>
        );
      })}
    </g>
  );
}
