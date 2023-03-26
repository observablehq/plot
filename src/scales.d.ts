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
  /**
   * If true, clamp input values to the scale’s domain. Clamping is typically
   * used in conjunction with setting an explicit domain since if the domain is
   * inferred, no values will be outside the domain. Clamping is useful for
   * focusing on a subset of the data while ensuring that extreme values remain
   * visible, but use caution: clamped values may need an annotation to avoid
   * misinterpretation.
   */
  clamp?: boolean;
  /**
   * If true (or a tick count), extend the domain to nice round values. Defaults
   * to 1, 2 or 5 times a power of 10 for linear scales, and meaningful time
   * intervals for utc and time scales. Pass an interval such as *minute*,
   * *wednesday* or *month* to specify what constitutes a nice round value.
   */
  nice?: boolean | number | NiceInterval;
  /**
   * Whether the domain must include zero.
   */
  zero?: boolean;
  /**
   * If true, round the output value of a position scale to the nearest integer
   * (whole pixel).
   */
  round?: boolean;
  /**
   * Where to distribute point and band scales (0 = at start, 0.5 = at middle, 1
   * = at end).
   */
  align?: number;
  /**
   * How much of the range to reserve to inset first and last point or band;
   * defaults to 0.5 (50%) for point scales, and 0.1 (10%) for band scales.
   */
  padding?: number;

  /**
   * The axis anchor, for position scales. Equivalent to the **anchor** option
   * of the **axisX** or **axisY** marks.
   */
  axis?: AxisAnchor | "both" | boolean | null; // for position scales

  /**
   * Whether to show a grid aligned with the scale’s ticks. The option can be
   * specified as true, in which case it will create a grid with 0.1 opacity, or
   * as a string specifying the grid color, which defaults to currentColor. It
   * can also be specified as an approximate number of ticks, an interval, or an
   * array of tick values. Use the **grid** mark if you need more control.
   */
  grid?: boolean | string | RangeInterval | Iterable<any>;

  /**
   * The scale’s label, to be shown on the axis or legend. Use null to disable
   * the default label inferred from the corresponding channels’ definitions.
   */
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
   * A scale’s domain is the extent of its inputs (abstract values). It is
   * typically inferred automatically from the channel values.
   *
   * For continuous data: [*min*, *max*]. Can be [*max*, *min*] to reverse the
   * scale.
   *
   * For ordinal data: [...*values*], in order.
   */
  domain?: Iterable<any>;

  /**
   * A scale’s range is the extent of its outputs (visual values). It is
   * typically inferred automatically from the domain and the plot’s dimensions
   * (for positional scales).
   *
   * For continuous data: [*min*, *max*]. Can be [*max*, *min*] to reverse the
   * scale.
   *
   * For ordinal data: [...*values*], in order.
   */
  range?: Iterable<any>;

  /**
   * The output (visual value) to use for invalid (or unknown, null, N/A…) input
   * values. Defaults to null, filtering out the corresponding marks.
   */
  unknown?: any;

  /**
   * Whether to reverse the scale’s range. Note that by default, when the *y*
   * scale is continuous, the *max* value points to the top of the screen,
   * whereas ordinal values are ranked from top to bottom.
   */
  reverse?: boolean;

  /**
   * A transform to apply to any value before scaling:
   *
   * ```js
   * x: {transform: d => Math.log(1+d)} // custom log1p scale
   * ```
   *
   * See also **percent** and **interval**.
   */
  transform?: (t: any) => any;

  /**
   * For data at regular intervals, such as integer values or daily samples, the
   * *scale*.**interval** option can be used to enforce uniformity. The
   * specified *interval*—such as d3.utcMonth—must expose an
   * *interval*.floor(*value*), *interval*.offset(*value*), and
   * *interval*.range(*start*, *stop*) functions. The option can also be
   * specified as a number, in which case it will be promoted to a numeric
   * interval with the given step. The option can alternatively be specified as
   * a string (*second*, *minute*, *hour*, *day*, *week*, *month*, *quarter*,
   * *half*, *year*, *monday*, *tuesday*, *wednesday*, *thursday*, *friday*,
   * *saturday*, *sunday*) naming the corresponding UTC interval. This option
   * sets the default *scale*.transform to the given interval’s *interval*.floor
   * function. In addition, the default *scale*.domain is an array of
   * uniformly-spaced values spanning the extent of the values associated with
   * the scale.
   */
  interval?: RangeInterval;

  /**
   * Shorthand for the percentages scale transform, which maps proportions [0, 1]
   * to [0, 100].
   */
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

  /** Power scale exponent (*e.g.* 0.5 for sqrt; defaults to 1). */
  exponent?: number;

  /** Log scale base, to control tick values (*e.g.* 2; defaults to 10). */
  base?: number;

  /**
   * Symlog scale constant, expressing the magnitude of the linear region around
   * the origin (defaults to 1).
   */
  constant?: number;

  /**
   * For a quantile scale, the number of quantiles (creates *n* - 1 thresholds);
   * for a quantize scale, the approximate number of thresholds. Defaults to 5.
   */
  n?: number;

  /**
   * @deprecated use *n* instead.
   */
  quantiles?: number;

  /**
   * For a diverging scale, the *pivot* value (defaults to 0, except for the
   * diverging-log scale where it defaults to 1). By default, all diverging
   * scales are symmetric around the pivot; set *symmetric* to false if you want
   * to cover the whole extent on both sides.
   */
  pivot?: any;

  /**
   * For a diverging scale, whether the scale is symmetric around the *pivot*.
   * Defaults to true; set to false if you want to cover the whole extent on
   * both sides.
   */
  symmetric?: boolean;

  /**
   * For a band scale, how much of the range to reserve to separate adjacent bands.
   */
  paddingInner?: number;
  /**
   * For a band scale, how much of the range to reserve to inset first and last
   * bands.
   */
  paddingOuter?: number;

  /**
   * If true, produces a legend for the scale (only *color*, *opacity*, and
   * *symbol* scales are currently supported). For quantitative color scales,
   * the legend defaults to *ramp* but may be set to *swatches* for discrete
   * scale types such as *threshold*. An opacity scale is treated as a color
   * scale with varying transparency. The symbol legend is combined with color
   * if they encode the same channels. For more control, see *plot*.**legend**.
   */
  legend?: LegendType | boolean | null;

  /**
   * For a continuous scale axis (or *ramp* color legend), defines the ticks as
   * an approximate number of ticks, an explicit array of tick values, or an
   * interval such as *day* or *month*.
   */
  ticks?: number | RangeInterval | Iterable<any>;

  /**
   * The length of tick vectors in pixels; negative values extend in the
   * opposite direction.
   */
  tickSize?: number;

  /**
   * The default approximate number of ticks is computed as the ratio between
   * the axis’s length and this option, which defaults to 80 pixels for *x* and
   * *fx*, and 35 pixels for *y* and *fy*.
   */
  tickSpacing?: number;

  /**
   * The separation between the tick vector and its label (in pixels; default
   * 3).
   */
  tickPadding?: number;

  /**
   * The tick label format specifier. String specifiers are passed to
   * [d3-format](https://github.com/d3/d3-format) for numeric scales, and
   * [d3-time-format](https://github.com/d3/d3-time-format) for *time* and *utc*
   * scales. If a function, it is passed the tick value and tick index, and
   * returns a string. Plot also provides multilingual format helpers for
   * convenience: **formatIsoDate**, **formatWeekDay** and **formatMonth**.
   */
  tickFormat?: string | ((t: any, i: number) => any) | null;

  /**
   * The rotation angle of tick labels in degrees (default 0).
   */
  tickRotate?: number;

  /**
   * The font-variant attribute for axis ticks; defaults to tabular-nums for
   * quantitative axes.
   */
  fontVariant?: string;

  /**
   * A short label representing the axis in the accessibility tree.
   */
  ariaLabel?: string;

  /**
   * A textual description for the axis.
   */
  ariaDescription?: string;

  /**
   * Anchor for the axis label.
   */
  labelAnchor?: "top" | "right" | "bottom" | "left" | "center";
  labelOffset?: number;

  /**
   * Whether a line should be drawn on the axis.
   */
  line?: boolean;
}

export interface Scale extends ScaleOptions {
  /**
   * The scale’s materialized bandwidth (for a point or band scale); equal to
   * the step minus any padding.
   */
  bandwidth?: number;

  /**
   * The scale’s materialized step (for a point or band scale), denoting the
   * distance between two consecutive ticks, in pixels. See bandwidth.
   */
  step?: number;

  /**
   * The scale’s materialized forward function, transforming a value in the
   * input domain into a value in the output range.
   */
  apply(t: any): any;

  /**
   * The scale’s materialized reverse function, returning a value in the input
   * domain from a given value in the output range.
   */
  invert?(t: any): any;
}

/**
 * Creates a standalone scale. The *options* object must define at least one
 * scale. For example, here is a linear color scale with the default domain of
 * [0, 1] and default scheme *turbo*:
 *
 * ```js
 * const color = Plot.scale({color: {type: "linear"}});
 * ```
 */
export function scale(options?: {[name in ScaleName]?: ScaleOptions}): Scale;
