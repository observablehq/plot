import type {InsetOptions} from "./inset.js";
import type {Interpolate} from "./interpolate.js";
import type {Interval} from "./interval.js";

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

export type ColorSchemeName =
  | "accent"
  | "category10"
  | "dark2"
  | "paired"
  | "pastel1"
  | "pastel2"
  | "set1"
  | "set2"
  | "set3"
  | "tableau10"
  | "brbg"
  | "prgn"
  | "piyg"
  | "puor"
  | "rdbu"
  | "rdgy"
  | "rdylbu"
  | "rdylgn"
  | "spectral"
  | "burd"
  | "buylrd"
  | "blues"
  | "greens"
  | "greys"
  | "oranges"
  | "purples"
  | "reds"
  | "turbo"
  | "viridis"
  | "magma"
  | "inferno"
  | "plasma"
  | "cividis"
  | "cubehelix"
  | "warm"
  | "cool"
  | "bugn"
  | "bupu"
  | "gnbu"
  | "orrd"
  | "pubu"
  | "pubugn"
  | "purd"
  | "rdpu"
  | "ylgn"
  | "ylgnbu"
  | "ylorbr"
  | "ylorrd"
  | "rainbow"
  | "sinebow";

export type ScalesOptions = {[key in ScaleName]?: ScaleOptions};

export interface ScaleOptions extends ScaleAxisOptions, ScaleLegendOptions, InsetOptions {
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
  axis?: "top" | "right" | "bottom" | "left" | "both" | boolean | null;
  ticks?: number | Interval | Iterable<any>;
  tickSpacing?: number;
  tickSize?: number;
  tickPadding?: number;
  tickFormat?: string | ((t: any, i: number) => any) | null;
  tickRotate?: number;
  grid?: boolean | string | Interval | Iterable<any>;
  line?: boolean;
  label?: string | null;
  labelOffset?: number;
  labelAnchor?: "top" | "right" | "bottom" | "left" | "center";
  fontVariant?: string;
}

export interface ScaleLegendOptions {
  legend?: string | boolean | null; // TODO
  fill?: string;
  stroke?: string;
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
