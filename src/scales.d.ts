import type {ColorSchemeName} from "./color.js";
import type {InsetOptions} from "./inset.js";
import type {Interpolate} from "./interpolate.js";
import type {NiceInterval, RangeInterval} from "./interval.js";
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

export interface ScaleDefaults extends InsetOptions {
  clamp?: boolean;
  nice?: boolean | number | NiceInterval;
  zero?: boolean;
  round?: boolean;
  align?: number;
  padding?: number;

  // axis options
  axis?: AxisAnchor | "both" | boolean | null; // for position scales
  grid?: boolean | string | RangeInterval | Iterable<any>;
  label?: string | null;
}

export interface ScaleOptions extends ScaleDefaults {
  /**
   * For quantitative data:
   * * *linear* (default) - linear transform (translate and scale)
   * * *pow* - power (exponential) transform
   * * *sqrt* - square-root transform; *pow* with *exponent* = 0.5
   * * *log* - logarithmic transform
   * * *symlog* - bi-symmetric logarithmic transform per Webber et al.
   *
   * For temporal data:
   * * *utc* (default, recommended) - UTC time
   * * *time* - local time
   *
   * For ordinal data:
   * * *ordinal* -
   * * *point* -
   * * *band* -
   *
   * For color:
   * * *categorical* - equivalent to *ordinal*; defaults to *tableau10*
   * * *sequential* - equivalent to *linear*; defaults to *turbo*
   * * *cyclical* - equivalent to *linear*; defaults to *rainbow*
   * * *threshold* - encodes using discrete thresholds; defaults to *rdylbu*
   * * *quantile* - encodes using quantile thresholds; defaults to *rdylbu*
   * * *quantize* - uniformly quantizes a continuous domain; defaults to *rdylbu*
   * * *diverging* - *linear*, but with a pivot; defaults to *rdbu*
   * * *diverging-log* - *log*, but with a pivot; defaults to *rdbu*
   * * *diverging-pow* - *pow*, but with a pivot; defaults to *rdbu*
   * * *diverging-sqrt* - *sqrt*, but with a pivot; defaults to *rdbu*
   * * *diverging-symlog* - *symlog*, but with a pivot; defaults to *rdbu*
   *
   * Other scale types:
   * * *identity* -
   */
  type?: ScaleType | null;

  /**
   * For continuous data: [*min*, *max*]. Can be [*max*, *min*] to reverse the scale.
   *
   * For ordinal data: [...*values*], in order.
   */
  domain?: Iterable<any>;

  /**
   * For continuous data: [*min*, *max*]. Can be [*max*, *min*] to reverse the scale.
   *
   * For ordinal data: [...*values*], in order.
   */
  range?: Iterable<any>;

  unknown?: any;
  reverse?: boolean;
  transform?: (t: any) => any;

  // quantitative scale options
  interval?: RangeInterval;
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
  paddingInner?: number;
  paddingOuter?: number;

  // axis and legend options
  legend?: LegendType | boolean | null; // for color, opacity, and symbol scales
  ticks?: number | RangeInterval | Iterable<any>;
  tickSize?: number;
  tickSpacing?: number;
  tickPadding?: number;
  tickFormat?: string | ((t: any, i: number) => any) | null;
  tickRotate?: number;
  fontVariant?: string;
  ariaLabel?: string;
  ariaDescription?: string;
  labelAnchor?: "top" | "right" | "bottom" | "left" | "center";
  labelOffset?: number;
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
  interval?: RangeInterval;
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

export function scale(options?: {[name in ScaleName]?: ScaleOptions}): any;
