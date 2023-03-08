import type {Interval} from "./interval.js";

export type ScaleType = QuantitativeScaleType | TemporalScaleType | OrdinalScaleType;
export type QuantitativeScaleType = "linear" | "pow" | "sqrt" | "log" | "symlog";
export type TemporalScaleType = "utc" | "time";
export type OrdinalScaleType = "ordinal" | "categorical";
export type OrdinalPositionScaleType = "point" | "band" | "ordinal";
export type ColorScaleType = QuantitativeScaleType | "sequential" | "diverging" | "categorical";

export type CategoricalColorSchemeName =
  | "accent"
  | "category10"
  | "dark2"
  | "paired"
  | "pastel1"
  | "pastel2"
  | "set1"
  | "set2"
  | "set3"
  | "tableau10";

export type DivergingColorSchemeName =
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
  | "buylrd";

export type SequentialColorSchemeName =
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
  | "ylorrd";

export type CyclicalColorSchemeName = "rainbow" | "sinebow";

export type QuantitativeColorSchemeName =
  | DivergingColorSchemeName
  | SequentialColorSchemeName
  | CyclicalColorSchemeName;

export type ColorSchemeName = QuantitativeColorSchemeName | CategoricalColorSchemeName;

export interface ScaleOptions extends AxisOptions, LegendOptions {
  type?: ScaleType | null;
  domain?: any[];
  range?: any[];
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

  // TODO quantile scale
  // TODO quantize scale
  // TODO threshold scale

  // diverging scale options
  pivot?: any;
  symmetric?: boolean;

  // position scale options
  inset?: number;
  insetTop?: number;
  insetRight?: number;
  insetBottom?: number;
  insetLeft?: number;
  round?: boolean;
  padding?: number;
  paddingInner?: number;
  paddingOuter?: number;
  align?: number;
}

export interface AxisOptions {
  axis?: "top" | "right" | "bottom" | "left" | "both" | boolean | null;
  ticks?: number | Interval | any[];
  tickSize?: number;
  tickSpacing?: number;
  tickPadding?: number;
  tickFormat?: string | ((t: any) => string) | null;
  tickRotate?: number;
  grid?: boolean;
  line?: boolean;
  label?: string | null;
  labelOffset?: number;
  labelAnchor?: "top" | "right" | "bottom" | "left" | "center";
  fontVariant?: CSSStyleDeclaration["fontVariant"];
  // ariaLabel?: string; // TODO
  // ariaDescription?: string; // TODO
}

export interface LegendOptions {
  legend?: string | boolean | null; // TODO
}

export type Interpolate = string; // TODO

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

/** @jsdoc scale */
export function scale(options?: {}): any;
