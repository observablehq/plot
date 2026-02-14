// @ts-nocheck — React components importing from untyped JS modules
import React from "react";
import {AreaX, AreaY} from "./Area.js";
import {LineX, LineY} from "./Line.js";

export interface BollingerProps {
  data?: any;
  x?: any;
  y?: any;
  x1?: any;
  x2?: any;
  y1?: any;
  y2?: any;
  fill?: string;
  fillOpacity?: number;
  stroke?: string;
  strokeWidth?: number;
  strokeOpacity?: number;
  n?: number;
  k?: number;
  className?: string;
  [key: string]: any;
}

// BollingerX renders a horizontal Bollinger band (area + line along x).
// Users should pre-compute band values using the window transform with
// mean ± k*deviation. This component composes AreaX + LineX.
export function BollingerX({
  data,
  x,
  y,
  x1,
  x2,
  fill = "currentColor",
  fillOpacity = 0.2,
  stroke = "currentColor",
  strokeWidth = 1.5,
  className,
  ...rest
}: BollingerProps) {
  return (
    <>
      <AreaX
        data={data}
        x={x1 ?? x}
        x1={x1}
        x2={x2}
        y={y}
        fill={fill}
        fillOpacity={fillOpacity}
        className={className}
        {...rest}
      />
      <LineX data={data} x={x} y={y} stroke={stroke} strokeWidth={strokeWidth} className={className} {...rest} />
    </>
  );
}

// BollingerY renders a vertical Bollinger band (area + line along y).
export function BollingerY({
  data,
  x,
  y,
  y1,
  y2,
  fill = "currentColor",
  fillOpacity = 0.2,
  stroke = "currentColor",
  strokeWidth = 1.5,
  className,
  ...rest
}: BollingerProps) {
  return (
    <>
      <AreaY
        data={data}
        x={x}
        y={y1 ?? y}
        y1={y1}
        y2={y2}
        fill={fill}
        fillOpacity={fillOpacity}
        className={className}
        {...rest}
      />
      <LineY data={data} x={x} y={y} stroke={stroke} strokeWidth={strokeWidth} className={className} {...rest} />
    </>
  );
}
