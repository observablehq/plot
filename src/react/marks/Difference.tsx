import React from "react";
import {Area} from "./Area.js";
import {Line} from "./Line.js";

export interface DifferenceProps {
  data?: any;
  x?: any;
  x1?: any;
  x2?: any;
  y?: any;
  y1?: any;
  y2?: any;
  positiveFill?: string;
  negativeFill?: string;
  positiveFillOpacity?: number;
  negativeFillOpacity?: number;
  stroke?: string;
  strokeWidth?: number;
  className?: string;
  [key: string]: any;
}

// DifferenceY renders the difference between two y-series as filled areas.
// Positive differences (y1 > y2) are one color; negative differences another.
// This renders two overlapping areas: one for the positive region and one for
// the negative region. A full clip-path implementation would mask each area
// to only show where it is on top, but this approximation works for most cases.
export function DifferenceY({
  data,
  x,
  y1,
  y2,
  positiveFill = "#4daf4a",
  negativeFill = "#377eb8",
  positiveFillOpacity = 0.4,
  negativeFillOpacity = 0.4,
  stroke = "currentColor",
  strokeWidth = 1,
  className,
  ...rest
}: DifferenceProps) {
  return (
    <>
      {/* Positive difference area (where y1 < y2 in screen coords, i.e. y1 > y2 in data) */}
      <Area
        data={data}
        x1={x}
        x2={x}
        y1={y1}
        y2={y2}
        fill={positiveFill}
        fillOpacity={positiveFillOpacity}
        className={className}
        {...rest}
      />
      {/* Negative difference area (where y2 < y1 in screen coords, i.e. y2 > y1 in data) */}
      <Area
        data={data}
        x1={x}
        x2={x}
        y1={y2}
        y2={y1}
        fill={negativeFill}
        fillOpacity={negativeFillOpacity}
        className={className}
        {...rest}
      />
      {/* Reference line */}
      <Line
        data={data}
        x={x}
        y={y2}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray="2,2"
        className={className}
        {...rest}
      />
      {/* Primary line */}
      <Line data={data} x={x} y={y1} stroke={stroke} strokeWidth={strokeWidth} className={className} {...rest} />
    </>
  );
}

// DifferenceX renders the difference between two x-series.
export function DifferenceX({
  data,
  x1,
  x2,
  y,
  positiveFill = "#4daf4a",
  negativeFill = "#377eb8",
  positiveFillOpacity = 0.4,
  negativeFillOpacity = 0.4,
  stroke = "currentColor",
  strokeWidth = 1,
  className,
  ...rest
}: DifferenceProps) {
  return (
    <>
      <Area
        data={data}
        x1={x1}
        x2={x2}
        y1={y}
        y2={y}
        fill={positiveFill}
        fillOpacity={positiveFillOpacity}
        className={className}
        {...rest}
      />
      <Area
        data={data}
        x1={x2}
        x2={x1}
        y1={y}
        y2={y}
        fill={negativeFill}
        fillOpacity={negativeFillOpacity}
        className={className}
        {...rest}
      />
      <Line
        data={data}
        x={x2}
        y={y}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray="2,2"
        className={className}
        {...rest}
      />
      <Line data={data} x={x1} y={y} stroke={stroke} strokeWidth={strokeWidth} className={className} {...rest} />
    </>
  );
}
