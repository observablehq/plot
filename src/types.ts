/* eslint-disable @typescript-eslint/no-explicit-any */

export type Row = Record<string, any>;

export type Data = Row[];

export type Accessor = (d: any) => any;

export type Channel = string | Accessor;

export interface MarkOptions {
  x?: Channel;
  y?: Channel;
  fill?: Channel;
  fillOpacity?: Channel;
  stroke?: Channel;
  strokeOpacity?: Channel;
  strokeWidth?: Channel;
  opacity?: Channel;
  title?: Channel;
  href?: Channel;
  ariaLabel?: Channel;
}

export interface ScaleOptions {
  domain?: any[];
  range?: any[];
  type?:
    | "time"
    | "utc"
    | "diverging"
    | "diverging-sqrt"
    | "diverging-pow"
    | "diverging-log"
    | "diverging-symlog"
    | "categorical"
    | "ordinal"
    | "cyclical"
    | "sequential"
    | "linear"
    | "sqrt"
    | "threshold"
    | "quantile"
    | "quantize"
    | "pow"
    | "log"
    | "symlog"
    | "utc"
    | "time"
    | "point"
    | "band"
    | "identity";
  unknown?: any;
  reverse?: boolean;
  interval?: any;
  tickFormat?: string | ((d: any) => any);
  base?: number;
  exponent?: number;
  clamp?: boolean;
  nice?: boolean;
  zero?: boolean;
  percent?: boolean;
  transform?: (t: any) => any;
  inset?: number;
  round?: boolean;
  insetLeft?: number;
  insetRight?: number;
  insetTop?: number;
  insetBottom?: number;
  padding?: number;
  align?: number;
  paddingInner?: number;
  paddingOuter?: number;
  axis?: "top" | "bottom" | "left" | "right" | null;
  ticks?: number;
  tickSize?: number;
  tickPadding?: number;
  tickRotate?: number;
  line?: boolean;
  label?: string;
  labelAnchor?: "top" | "right" | "bottom" | "left" | "center";
  labelOffset?: number;
  legend?: boolean;
  fontVariant?: string;
  ariaLabel?: string;
  ariaDescription?: string;
}

export interface ColorScaleOptions {
  scheme?:
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
  interpolate?: "number" | "rgb" | "hsl" | "hcl" | "lab" | ((t: number) => string);
  pivot?: number;
}

export interface PlotOptions {
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
  margin?: number;
  width?: number;
  height?: number;
  marks?: any[];
  style?: Record<string, string>;
  caption?: string | Element;
  x?: ScaleOptions;
  y?: ScaleOptions;
  r?: ScaleOptions;
  color?: ScaleOptions & ColorScaleOptions;
  opacity?: ScaleOptions;
  length?: ScaleOptions;
  symbol?: ScaleOptions;
  grid?: boolean;
  facet?: FacetOptions;
}

export interface FacetOptions {
  data: any;
  x?: any;
  y?: any;
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
  margin?: number;
  grid?: boolean;
  label?: string;
}
