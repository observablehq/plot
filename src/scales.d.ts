import type {Interval} from "./interval.js";

export type ScaleType = QuantitativeScaleType | TemporalScaleType | OrdinalScaleType;
export type QuantitativeScaleType = "linear" | "pow" | "sqrt" | "log" | "symlog";
export type TemporalScaleType = "utc" | "time";
export type OrdinalScaleType = "ordinal";
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

export interface ScaleOptions {
  type?: ScaleType | null;
  domain?: any[];
  range?: any[];
  unknown?: any;
  reverse?: boolean;
  transform?: (t: any) => any;
}

export type Interpolate = string; // TODO

export interface QuantitativeScaleOptions {
  interval?: Interval;
  clamp?: boolean;
  nice?: boolean | number | Interval;
  zero?: boolean;
  percent?: boolean;
  interpolate?: Interpolate;
}

// TODO quantile scale
// TODO quantize scale
// TODO threshold scale

export interface PowerScaleOptions {
  exponent?: number;
}

export interface LogScaleOptions {
  base?: number;
}

export interface SymlogScaleOptions {
  constant?: number;
}

export interface DivergingScaleOptions {
  pivot?: any;
  symmetric?: boolean;
}

export interface ColorScaleOptions {
  scheme?: ColorSchemeName;
  // TODO interpolate
}

export interface PositionScaleOptions {
  inset?: number;
  round?: boolean;
}

export interface HorizontalPositionScaleOptions {
  insetLeft?: number;
  insetRight?: number;
}

export interface VerticalPositionScaleOptions {
  insetTop?: number;
  insetBottom?: number;
}

export interface OrdinalPositionScaleOptions {
  padding?: number;
  align?: number;
}

export interface BandPositionScaleOptions {
  paddingInner?: number;
  paddingOuter?: number;
}

export interface LegendOptions {
  legend?: string; // TODO
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

/** @jsdoc scale */
export function scale(options?: {}): any;
