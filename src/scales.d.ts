import type {ColorSchemeName} from "./color.js";
import type {InsetOptions} from "./inset.js";
import type {Interpolate} from "./interpolate.js";
import type {Interval} from "./interval.js";
import type {LegendType} from "./legends.js";
import type {AxisAnchor} from "./marks/axis.js";

export type ScaleName = "x" | "y" | "fx" | "fy" | "r" | "color" | "opacity" | "symbol" | "length";

export type ScaleFunctions = {[key in ScaleName]?: (value: any) => any};

export type ScaleType =
  | "linear"
  | "pow"
  | "sqrt"
  | "log"
  | "symlog"
  | "utc"
  | "time"
  | "point"
  | "band"
  | "ordinal"
  | "sequential"
  | "diverging"
  | "diverging-log"
  | "diverging-pow"
  | "diverging-sqrt"
  | "diverging-symlog"
  | "categorical"
  | "threshold"
  | "quantile"
  | "quantize"
  | "identity";

export type ScalesOptions = {[key in ScaleName]?: ScaleOptions};

export interface ScaleOptions extends ScaleAxisOptions, InsetOptions {
  type?: ScaleType | null;
  domain?: Iterable<any>;
  range?: Iterable<any>;
  unknown?: any;
  reverse?: boolean;
  transform?: (t: any) => any;

  // quantitative scale options
  interval?: Interval;
  clamp?: boolean;
  nice?: boolean | number | Interval;
  zero?: boolean;
  percent?: boolean;

  // color scale options
  scheme?: ColorSchemeName;
  interpolate?: Interpolate;

  // power scale options
  exponent?: number;

  // log scale options
  base?: number;

  // symlog scale options
  constant?: number;

  // quantize and quantile scale options
  n?: number;
  quantiles?: number; // deprecated; use n instead

  // diverging scale options
  pivot?: any;
  symmetric?: boolean;

  // position scale options
  round?: boolean;
  padding?: number;
  paddingInner?: number;
  paddingOuter?: number;
  align?: number;
}

export interface ScaleAxisOptions {
  axis?: AxisAnchor | "both" | boolean | null; // for position scales
  legend?: LegendType | boolean | null; // for color, opacity, and symbol scales
  ticks?: number | Interval | Iterable<any>;
  tickSize?: number;
  tickSpacing?: number;
  tickPadding?: number;
  tickFormat?: string | ((t: any, i: number) => any) | null;
  tickRotate?: number;
  fontVariant?: string;
  ariaLabel?: string;
  ariaDescription?: string;
  label?: string | null;
  labelAnchor?: "top" | "right" | "bottom" | "left" | "center";
  labelOffset?: number;
  grid?: boolean | string | Interval | Iterable<any>;
  line?: boolean;
}

// TODO greater specificity
export interface Scale {
  type: ScaleType;
  domain: any[];
  range?: any[];
  transform?: (t: any) => any;
  percent?: boolean;
  unknown?: any;
  interval?: Interval;
  interpolate?: Interpolate;
  clamp?: boolean;
  pivot?: any;
  symmetric?: boolean;
  base?: number;
  exponent?: number;
  constant?: number;
  align?: number;
  round?: boolean;
  padding?: number;
  paddingInner?: number;
  paddingOuter?: number;
  bandwidth?: number;
  step?: number;
  apply(t: any): any;
  invert?(t: any): any;
}

export function scale(options?: {}): any;
