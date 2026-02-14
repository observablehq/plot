import React from "react";
import {usePlotContext} from "../PlotContext.js";

export interface FrameProps {
  stroke?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  fill?: string;
  fillOpacity?: number;
  rx?: number;
  ry?: number;
  inset?: number;
  insetTop?: number;
  insetRight?: number;
  insetBottom?: number;
  insetLeft?: number;
  className?: string;
}

export function Frame({
  stroke = "currentColor",
  strokeWidth = 1,
  strokeDasharray,
  fill = "none",
  fillOpacity,
  rx,
  ry,
  inset = 0,
  insetTop = inset,
  insetRight = inset,
  insetBottom = inset,
  insetLeft = inset,
  className
}: FrameProps) {
  const {dimensions} = usePlotContext();
  if (!dimensions) return null;

  const {width, height, marginTop, marginRight, marginBottom, marginLeft} = dimensions;
  const x = marginLeft + insetLeft;
  const y = marginTop + insetTop;
  const w = width - marginLeft - marginRight - insetLeft - insetRight;
  const h = height - marginTop - marginBottom - insetTop - insetBottom;

  return (
    <rect
      aria-label="frame"
      x={x}
      y={y}
      width={Math.max(0, w)}
      height={Math.max(0, h)}
      fill={fill}
      fillOpacity={fillOpacity}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeDasharray={strokeDasharray}
      rx={rx}
      ry={ry}
      className={className}
    />
  );
}
