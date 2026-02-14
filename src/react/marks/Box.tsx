// @ts-nocheck — React components importing from untyped JS modules
import React from "react";
import {BarX, BarY} from "./Bar.js";
import {RuleX, RuleY} from "./Rule.js";
import {TickX, TickY} from "./Tick.js";
import {Dot} from "./Dot.js";

export interface BoxProps {
  data?: any;
  x?: any;
  y?: any;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  r?: number;
  className?: string;
  [key: string]: any;
}

// BoxX renders a horizontal box plot (quartiles along x-axis, grouped by y)
export function BoxX({data, x, y, fill = "#ccc", stroke = "currentColor", strokeWidth, r = 2, ...rest}: BoxProps) {
  return (
    <>
      <RuleX data={data} x={x} y={y} stroke={stroke} {...rest} />
      <BarX data={data} x={x} y={y} fill={fill} stroke={stroke} strokeWidth={strokeWidth} {...rest} />
      <TickX
        data={data}
        x={x}
        y={y}
        stroke={stroke}
        strokeWidth={typeof strokeWidth === "number" ? strokeWidth * 2 : 2}
        {...rest}
      />
      <Dot data={data} x={x} y={y} r={r} fill="currentColor" stroke={stroke} {...rest} />
    </>
  );
}

// BoxY renders a vertical box plot (quartiles along y-axis, grouped by x)
export function BoxY({data, x, y, fill = "#ccc", stroke = "currentColor", strokeWidth, r = 2, ...rest}: BoxProps) {
  return (
    <>
      <RuleY data={data} x={x} y={y} stroke={stroke} {...rest} />
      <BarY data={data} x={x} y={y} fill={fill} stroke={stroke} strokeWidth={strokeWidth} {...rest} />
      <TickY
        data={data}
        x={x}
        y={y}
        stroke={stroke}
        strokeWidth={typeof strokeWidth === "number" ? strokeWidth * 2 : 2}
        {...rest}
      />
      <Dot data={data} x={x} y={y} r={r} fill="currentColor" stroke={stroke} {...rest} />
    </>
  );
}
