import type {InsetOptions} from "./inset.js";
import type {NiceInterval, RangeInterval} from "./interval.js";
import type {LegendType} from "./legends.js";
import type {AxisAnchor} from "./marks/axis.js";

/** How to interpolate range values for continuous scales. */
export type Interpolate =
  | "number"
  | "rgb"
  | "hsl"
  | "hcl"
  | "lab"
  | (<T>(a: T, b: T) => (t: number) => T)
  | ((t: number) => any);

type ColorSchemeCase =
  | "Accent"
  | "Category10"
  | "Dark2"
  | "Paired"
  | "Pastel1"
  | "Pastel2"
  | "Set1"
  | "Set2"
  | "Set3"
  | "Tableau10"
  | "BrBG"
  | "PRGn"
  | "PiYG"
  | "PuOr"
  | "RdBu"
  | "RdGy"
  | "RdYlBu"
  | "RdYlGn"
  | "Spectral"
  | "BuRd"
  | "BuYlRd"
  | "Blues"
  | "Greens"
  | "Greys"
  | "Oranges"
  | "Purples"
  | "Reds"
  | "Turbo"
  | "Viridis"
  | "Magma"
  | "Inferno"
  | "Plasma"
  | "Cividis"
  | "Cubehelix"
  | "Warm"
  | "Cool"
  | "BuGn"
  | "BuPu"
  | "GnBu"
  | "OrRd"
  | "PuBu"
  | "PuBuGn"
  | "PuRd"
  | "RdPu"
  | "YlGn"
  | "YlGnBu"
  | "YlOrBr"
  | "YlOrRd"
  | "Rainbow"
  | "Sinebow";

export type ColorScheme = ColorSchemeCase | (Lowercase<ColorSchemeCase> & Record<never, never>);

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
  | "cyclical"
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

  /**
   * Shorthand for setting the range or interpolate option of a *color* scale.
   *
   * Categorical schemes:
   *
   * * *Accent*
   * * *Category10*
   * * *Dark2*
   * * *Paired*
   * * *Pastel1*
   * * *Pastel2*
   * * *Set1*
   * * *Set2*
   * * *Set3*
   * * *Tableau10* (default)
   *
   * Sequential schemes:
   *
   * * *Blues*
   * * *Greens*
   * * *Greys*
   * * *Oranges*
   * * *Purples*
   * * *Reds*
   * * *Turbo* (default)
   * * *Viridis*
   * * *Magma*
   * * *Inferno*
   * * *Plasma*
   * * *Cividis*
   * * *Cubehelix*
   * * *Warm*
   * * *Cool*
   * * *BuGn*
   * * *BuPu*
   * * *GnBu*
   * * *OrRd*
   * * *PuBu*
   * * *PuBuGn*
   * * *PuRd*
   * * *RdPu*
   * * *YlGn*
   * * *YlGnBu*
   * * *YlOrBr*
   * * *YlOrRd*
   *
   * Diverging schemes:
   *
   * * *BrBG*
   * * *PRGn*
   * * *PiYG*
   * * *PuOr*
   * * *RdBu* (default)
   * * *RdGy*
   * * *RdYlBu*
   * * *RdYlGn*
   * * *Spectral*
   * * *BuRd*
   * * *BuYlRd*
   *
   * Cyclical schemes:
   *
   * * *Rainbow* (default)
   * * *Sinebow*
   */
  scheme?: ColorScheme;

  /**
   * For continuous scales: how to interpolate range values.
   *
   * * *number* - linear numeric interpolation
   * * *rgb* - red, green, blue (sRGB)
   * * *hsl* - hue, saturation, lightness (HSL; cylindrical sRGB)
   * * *hcl* - hue, chroma, perceptual lightness (CIELCh_ab; cylindrical CIELAB)
   * * *lab* - perceptual lightness and opponent colors (L\*a\*b\*, CIELAB)
   * * a function that takes a single argument t in [0, 1]
   * * a function that takes two arguments a and b to interpolate
   */
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

export interface Scale extends ScaleOptions {
  bandwidth?: number;
  step?: number;
  apply(t: any): any;
  invert?(t: any): any;
}

export function scale(options?: {[name in ScaleName]?: ScaleOptions}): any;
