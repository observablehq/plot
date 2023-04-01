import type {InsetOptions} from "./inset.js";
import type {NiceInterval, RangeInterval} from "./interval.js";
import type {LegendOptions} from "./legends.js";
import type {AxisOptions} from "./marks/axis.js";

/**
 * How to interpolate range (output) values for continuous scales; one of:
 *
 * - *number* - linear numeric interpolation
 * - *rgb* - red, green, blue (sRGB)
 * - *hsl* - hue, saturation, lightness (HSL; cylindrical sRGB)
 * - *hcl* - hue, chroma, perceptual lightness (CIELCh_ab; cylindrical CIELAB)
 * - *lab* - perceptual lightness and opponent colors (L\*a\*b\*, CIELAB)
 * - an interpolator function that takes a parameter *t* in [0, 1] and returns a value
 * - a interpolator factory that returns an interpolator function for values *a* and *b*
 */
export type Interpolate =
  | "number"
  | "rgb"
  | "hsl"
  | "hcl"
  | "lab"
  | (<T>(a: T, b: T) => (t: number) => T)
  | ((t: number) => any);

/** The built-in color schemes, cased. */
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

/**
 * The built-in color schemes. For categorical data, one of:
 *
 * - *Accent* - eight colors
 * - *Category10* - ten colors
 * - *Dark2* - eight colors
 * - *Paired* - twelve paired colors
 * - *Pastel1* - nine colors
 * - *Pastel2* - eight colors
 * - *Set1* - nine colors
 * - *Set2* - eight colors
 * - *Set3* - twelve colors
 * - *Tableau10* (default) - ten colors
 *
 * For diverging data, one of:
 *
 * - *BrBG* - from brown to white to blue-green
 * - *PRGn* - from purple to white to green
 * - *PiYG* - from pink to white to yellow-green
 * - *PuOr* - from purple to white to orange
 * - *RdBu* (default) - from red to white to blue
 * - *RdGy* - from red to white to gray
 * - *RdYlBu* - from red to yellow to blue
 * - *RdYlGn* - from red to yellow to green
 * - *Spectral* - from red to blue, through the spectrum
 * - *BuRd* - from blue to white to red
 * - *BuYlRd* - from blue to yellow to red
 *
 * For sequential data, one of:
 *
 * - *Blues* - from white to blue
 * - *Greens* - from white to green
 * - *Greys* - from white to gray
 * - *Oranges* - from white to orange
 * - *Purples* - from white to purple
 * - *Reds* - from white to red
 * - *Turbo* (default) - from blue to red, through the spectrum
 * - *Viridis* - from blue to green to yellow
 * - *Magma* - from purple to orange to yellow
 * - *Inferno* - from purple to orange to yellow
 * - *Plasma* - from purple to orange to yellow
 * - *Cividis* - from blue to yellow
 * - *Cubehelix* - from black to white, rotating hue
 * - *Warm* - from purple to green, through warm hues
 * - *Cool* - from green to to purple, through cool hues
 * - *BuGn* - from light blue to dark green
 * - *BuPu* - from light blue to dark purple
 * - *GnBu* - from light green to dark blue
 * - *OrRd* - from light orange to dark red
 * - *PuBu* - from light purple to dark blue
 * - *PuBuGn* - from light purple to blue to dark green
 * - *PuRd* - from light purple to dark red
 * - *RdPu* - from light red to dark purple
 * - *YlGn* - from light yellow to dark green
 * - *YlGnBu* - from light yellow to green to dark blue
 * - *YlOrBr* - from light yellow to orange to dark brown
 * - *YlOrRd* - from light yellow to orange to dark red
 *
 * For cyclical data, one of:
 *
 * - *Rainbow* (default) - the less-angry rainbow color scheme
 * - *Sinebow* - Bumgardner and Loyd’s “sinebow” scheme
 */
export type ColorScheme = ColorSchemeCase | (Lowercase<ColorSchemeCase> & Record<never, never>);

/**
 * The built-in scale names; one of:
 *
 * - *x* - horizontal position
 * - *y* - vertical position
 * - *fx* - horizontal facet position
 * - *fy* - vertical facet position
 * - *r* - radius (for dots and point geos)
 * - *color* - color
 * - *opacity* - opacity
 * - *symbol* - categorical symbol (for dots)
 * - *length* - length (for vectors)
 *
 * Position scales may have associated axes. Color, opacity, and symbol scales
 * may have an associated legend.
 */
export type ScaleName = "x" | "y" | "fx" | "fy" | "r" | "color" | "opacity" | "symbol" | "length";

/**
 * The instantiated scales’ apply functions; passed to marks and initializers
 * for rendering.
 */
export type ScaleFunctions = {[key in ScaleName]?: (value: any) => any};

/**
 * The supported scale types. For quantitative data, one of:
 *
 * - *linear* (default) - linear transform (translate and scale)
 * - *pow* - power (exponential) transform
 * - *sqrt* - square-root transform; *pow* with *exponent* = 0.5
 * - *log* - logarithmic transform
 * - *symlog* - bi-symmetric logarithmic transform per Webber et al.
 *
 * For temporal data, one of:
 *
 * - *utc* (default, recommended) - UTC time
 * - *time* - local time
 *
 * For ordinal data, one of:
 *
 * - *ordinal* - from discrete inputs to discrete outputs
 * - *point* (for position only) - divide a continuous range into discrete points
 * - *band* (for position only) - divide a continuous range into discrete points
 *
 * For color, one of:
 *
 * - *categorical* - equivalent to *ordinal*; defaults to *tableau10*
 * - *sequential* - equivalent to *linear*; defaults to *turbo*
 * - *cyclical* - equivalent to *linear*; defaults to *rainbow*
 * - *threshold* - encodes using discrete thresholds; defaults to *rdylbu*
 * - *quantile* - encodes using quantile thresholds; defaults to *rdylbu*
 * - *quantize* - uniformly quantizes a continuous domain; defaults to *rdylbu*
 * - *diverging* - *linear*, but with a pivot; defaults to *rdbu*
 * - *diverging-log* - *log*, but with a pivot; defaults to *rdbu*
 * - *diverging-pow* - *pow*, but with a pivot; defaults to *rdbu*
 * - *diverging-sqrt* - *sqrt*, but with a pivot; defaults to *rdbu*
 * - *diverging-symlog* - *symlog*, but with a pivot; defaults to *rdbu*
 *
 * Other scale types:
 *
 * - *identity* - do not transform values when encoding
 */
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

/** Options for scales, may be defined at the top-level. */
export interface ScaleDefaults extends InsetOptions {
  /**
   * If true, values below the domain minimum are treated as the domain minimum,
   * and values above the domain maximum are treated as the domain maximum.
   *
   * Clamping is useful for focusing on a subset of the data while ensuring that
   * extreme values remain visible, but use caution: clamped values may need an
   * annotation to avoid misinterpretation. Clamping typically requires setting
   * an explicit **domain** since if the domain is inferred, no values will be
   * outside the domain.
   *
   * For continuous scales only.
   */
  clamp?: boolean;

  /**
   * If true, or a tick count or interval, extend the domain to nice round
   * values. Defaults to 1, 2 or 5 times a power of 10 for *linear* scales, and
   * nice time intervals for *utc* and *time* scales. Pass an interval such as
   * *minute*, *wednesday* or *month* to specify what constitutes a nice
   * interval.
   *
   * For continuous scales only.
   */
  nice?: boolean | number | NiceInterval;

  /**
   * Whether the **domain** must include zero. If the domain minimum is
   * positive, it will be set to zero; otherwise if the domain maximum is
   * negative, it will be set to zero.
   *
   * For quantitative scales only.
   */
  zero?: boolean;

  /**
   * If true, round the output value to the nearest integer (pixel); useful for
   * crisp edges when rendering.
   *
   * For position scales only.
   */
  round?: boolean;

  /**
   * How to distribute unused space in the **range** for *point* and *band*
   * scales. A number in [0, 1], such as:
   *
   * - 0 - use the start of the range, putting unused space at the end
   * - 0.5 (default) - use the middle, distributing unused space evenly
   * - 1 use the end, putting unused space at the start
   *
   * For ordinal position scales only.
   */
  align?: number;

  /**
   * For *band* scales, how much of the **range** to reserve to separate
   * adjacent bands; defaults to 0.1 (10%). For *point* scales, the amount of
   * inset for the first and last value as a proportion of the bandwidth;
   * defaults to 0.5 (50%).
   *
   * For ordinal position scales only.
   */
  padding?: number;

  /**
   * The side of the frame on which to place the implicit axis: *top* or
   * *bottom* for *x* or *fx*, or *left* or *right* for *y* or *fy*. The default
   * depends on the scale:
   *
   * - *x* - *bottom*
   * - *y* - *left*
   * - *fx* - *top* if there is a *bottom* *x* axis, and otherwise *bottom*
   * - *fy* - *right* if there is a *left* *y* axis, and otherwise *right*
   *
   * If *both*, an implicit axis will be rendered on both sides of the plot
   * (*top* and *bottom* for *x* or *fx*, or *left* and *right* for *y* or
   * *fy*). If null, the implicit axis is suppressed.
   *
   * For position axes only.
   */
  axis?: AxisOptions["anchor"] | "both" | boolean | null;

  /**
   * Whether to show a grid aligned with the scale’s ticks. If true, show a grid
   * with the currentColor stroke; if a string, show a grid with the specified
   * stroke color; if an approximate number of ticks, an interval, or an array
   * of tick values, show corresponding grid lines. See also the grid mark.
   *
   * For axes only.
   */
  grid?: boolean | string | RangeInterval | Iterable<any>;

  /**
   * A textual label to show on the axis or legend; if null, show no label. By
   * default the scale label is inferred from channel definitions, possibly with
   * an arrow (↑, →, ↓, or ←) to indicate the direction of increasing value.
   *
   * For axes and legends only.
   */
  label?: string | null;
}

/** Options for scales. */
export interface ScaleOptions extends ScaleDefaults {
  /**
   * The scale type, affecting how the scale encodes abstract data, say by
   * applying a mathematical transformation. If null, the scale is disabled.
   *
   * For quantitative data (numbers), defaults to *linear*; for temporal data
   * (dates), defaults to *utc*; for ordinal data (strings or booleans),
   * defaults to *point* for position scales, *categorical* for color scales,
   * and otherwise *ordinal*. However, the radius scale defaults to *sqrt*, and
   * the length and opacity scales default to *linear*; these scales are
   * intended for quantitative data. The plot’s marks may also impose a scale
   * type; for example, the barY mark requires that *x* is a *band* scale.
   */
  type?: ScaleType | null;

  /**
   * The extent of the scale’s inputs (abstract values). By default inferred
   * from channel values. For continuous data (numbers and dates), it is
   * typically [*min*, *max*]; it can be [*max*, *min*] to reverse the scale.
   * For ordinal data (strings or booleans), it is an array (or iterable) of
   * values is the desired order, defaulting to natural ascending order.
   *
   * Linear scales have a default domain of [0, 1]. Log scales have a default
   * domain of [1, 10] and cannot include zero. Radius scales have a default
   * domain from 0 to the median first quartile of associated channels. Length
   * have a default domain from 0 to the median median of associated channels.
   * Opacity scales have a default domain from 0 to the maximum value of
   * associated channels.
   */
  domain?: Iterable<any>;

  /**
   * The extent of the scale’s outputs (visual values). By default inferred from
   * the scale’s **type** and **domain**, and for position scales, the plot’s
   * dimensions. For continuous data (numbers and dates), and for ordinal
   * position scales (*point* and *band*), it is typically [*min*, *max*]; it
   * can be [*max*, *min*] to reverse the scale. For other ordinal data, such as
   * for a *color* scale, it is an array (or iterable) of output values in the
   * same order as the **domain**.
   *
   * Radius scales have a default range of [0, 3]. Length scales have a default
   * range of [0, 12]. Opacity scales have a default range of [0, 1]. Symbol
   * scales have a default range of categorical symbols; the choice of symbols
   * depends on whether the associated dot mark is filled or stroked.
   */
  range?: Iterable<any>;

  /**
   * The scale’s output (visual value) when the input is invalid; defaults to
   * null. If the scale outputs null, undefined, or NaN for a given input, by
   * default the corresponding mark index will be filtered out prior to render,
   * suppressing its display. For quantitative data, null, undefined, and NaN
   * are considered unknown inputs. For ordinal data, any value that is not
   * explicitly enumerated in the domain is considered an unknown input.
   */
  unknown?: any;

  /**
   * Whether to reverse the scale’s encoding; equivalent to reversing either the
   * **domain** or **range**. Note that by default, when the *y* scale is
   * continuous, the *max* value points to the top of the screen, whereas
   * ordinal values are ranked from top to bottom.
   */
  reverse?: boolean;

  /**
   * A transform to apply to any value prior to applying the scale. For example,
   * if channel values for the *y* scale are specified in degrees Celsius, you
   * can transform them to degrees Fahrenheit like so:
   *
   * ```js
   * y: {transform: (y) => (y) * 9 / 5 + 32}
   * ```
   *
   * A scale transform is also useful for quickly showing thousands (or
   * millions, billions) like so:
   *
   * ```js
   * y: {transform: (y) => (y) / 1000}
   * ```
   *
   * See also the **percent** and **interval** shorthand options.
   */
  transform?: (t: any) => any;

  /**
   * Enforces uniformity for data at regular intervals, such as integer values
   * or daily samples. The interval may be one of:
   *
   * - an object that implements *floor*, *offset*, and *range* methods
   * - a named time interval such as *day* (for date intervals)
   * - a number (for number intervals), defining intervals at integer multiples of *n*
   *
   * This option sets the default **transform** to the given interval’s
   * *interval*.floor function. In addition, the default **domain** will align
   * with interval boundaries.
   */
  interval?: RangeInterval;

  /**
   * If true, shorthand for a **transform** suitable for percentages, mapping
   * proportions in [0, 1] to [0, 100].
   */
  percent?: boolean;

  /**
   * If specified, shorthand for setting the **range** or **interpolate** option
   * of a *color* scale.
   */
  scheme?: ColorScheme;

  /**
   * How to interpolate range values. For quantitative scales only, and
   * typically for color scales. For color scales, this can be used to specify a
   * color space for interpolating colors specified in the **range**. For
   * example, to interpolate from orange to blue in *hcl* color space:
   *
   * ```js
   * color: {range: ["orange", "blue"], interpolate: "hcl"}
   * ```
   *
   * This is equivalent to
   *
   * ```js
   * color: {interpolate: d3.interpolateHcl("orange", "blue")}
   * ```
   */
  interpolate?: Interpolate;

  /**
   * A power scale’s exponent (*e.g.*, 0.5 for sqrt); defaults to 1 for a
   * linear scale. For *pow* and *diverging-pow* scales only.
   */
  exponent?: number;

  /**
   * A log scale’s base; defaults to 10. Does not affect the scale’s encoding,
   * but rather the default ticks. For *log* and *diverging-log* scales only.
   */
  base?: number;

  /**
   * A symlog scale’s constant, expressing the magnitude of the linear region
   * around the origin; defaults to 1. For *symlog* and *diverging-symlog*
   * scales only.
   */
  constant?: number;

  /**
   * For a *quantile* scale, the number of quantiles (creates *n* - 1
   * thresholds); for a *quantize* scale, the approximate number of thresholds;
   * defaults to 5.
   */
  n?: number;

  /** @deprecated See **n**. */
  quantiles?: number;

  /**
   * For a diverging color scale, the input value (abstract value) that divides
   * the domain into two parts; defaults to 0 for *diverging* scales, dividing
   * the domain into negative and positive parts; defaults to 1 for
   * *diverging-log* scales. By default, diverging scales are symmetric around
   * the pivot; see the **symmetric** option.
   */
  pivot?: any;

  /**
   * For a diverging color scale, if true (the default), extend the domain to
   * ensure that the lower part of the domain (below the **pivot**) is
   * commensurate with the upper part of the domain (above the **pivot**).
   *
   * A symmetric diverging color scale may not use all of its output **range**;
   * this reduces contrast but ensures that deviations both below and above the
   * **pivot** are represented proportionally. Otherwise if false, the full
   * output **range** will be used; this increases contrast but values on
   * opposite sides of the **pivot** may not be meaningfully compared.
   */
  symmetric?: boolean;

  /**
   * For a *band* scale, how much of the range to reserve to separate adjacent bands.
   */
  paddingInner?: number;

  /**
   * For a *band* scale, how much of the range to reserve to inset first and
   * last bands.
   */
  paddingOuter?: number;

  /**
   * If true, produces a legend for the scale. For quantitative color scales,
   * the legend defaults to *ramp* but may be set to *swatches* for discrete
   * scale types such as *threshold*. An opacity scale is treated as a color
   * scale with varying transparency. The symbol legend is combined with color
   * if they encode the same channels.
   *
   * For *color*, *opacity*, and *symbol* scales only. See also *plot*.legend.
   */
  legend?: LegendOptions["legend"] | boolean | null;

  /**
   * The desired approximate number of axis ticks, or an explicit array of tick
   * values, or an interval such as *day* or *month*.
   *
   * For axes and legends.
   */
  ticks?: number | RangeInterval | Iterable<any>;

  /**
   * The length of axis tick marks in pixels; negative values extend in the
   * opposite direction. Defaults to 6 for *x* and *y* axes and *color* and
   * *opacity* *ramp* legends, and 0 for *fx* and *fy* axes.
   *
   * For axes and legends.
   */
  tickSize?: number;

  /**
   * The desired approximate spacing between adjacent axis ticks, affecting the
   * default **ticks**; defaults to 80 pixels for *x* and *fx*, and 35 pixels
   * for *y* and *fy*.
   *
   * For axes.
   */
  tickSpacing?: number;

  /**
   * The distance between an axis tick mark and its associated text label (in
   * pixels); often defaults to 3, but may be affected by **tickSize** and
   * **tickRotate**.
   */
  tickPadding?: number;

  /**
   * How to format inputs (abstract values) for axis tick labels; one of:
   *
   * - a [d3-format](https://github.com/d3/d3-format) string for numeric scales
   * - a [d3-time-format](https://github.com/d3/d3-time-format) string for temporal scales
   * - a function passed a tick *value* and *index*, returning a string
   */
  tickFormat?: string | ((t: any, i: number) => any) | null;

  /**
   * The rotation angle of axis tick labels in degrees clocksize; defaults to 0.
   */
  tickRotate?: number;

  /**
   * The font-variant attribute for axis ticks; defaults to *tabular-nums* for
   * quantitative axes.
   */
  fontVariant?: string;

  /**
   * A short label representing the axis in the accessibility tree.
   */
  ariaLabel?: string;

  /**
   * A textual description for the axis in the accessibility tree.
   */
  ariaDescription?: string;

  /**
   * Where to place the axis **label** relative to the plot’s frame. For
   * vertical position scales (*y* and *fy*), may be *top*, *bottom*, or
   * *center*; for horizontal position scales (*x* and *fx*), may be *left*,
   * *right*, or *center*. Defaults to *center* for ordinal scales (including
   * *fx* and *fy*), and otherwise *top* for *y*, and *right* for *x*.
   *
   * For position axes only.
   */
  labelAnchor?: "top" | "right" | "bottom" | "left" | "center";

  /**
   * The axis **label** position offset (in pixels); default depends on margins
   * and orientation.
   */
  labelOffset?: number;

  /**
   * If true, draw a line along the axis; if false (default), do not.
   */
  line?: boolean;
}

/** A materialized scale, as returned by *plot*.scale. */
export interface Scale extends ScaleOptions {
  /**
   * The scale’s materialized bandwidth (for a *point* or *band* scale); equal
   * to the step minus any **padding**a.
   */
  bandwidth?: number;

  /**
   * The scale’s materialized step (for a *point* or *band* scale), denoting the
   * distance between two consecutive ticks, in pixels. See **bandwidth**.
   */
  step?: number;

  /**
   * The scale’s materialized forward application function, transforming an
   * abstract value in the input **domain** into a visual value in the output
   * **range**.
   */
  apply(t: any): any;

  /**
   * The scale’s materialized inverse application function, returning an
   * abstract value in the input **domain** from a given visual value in the
   * output **range**.
   */
  invert?(t: any): any;
}

/**
 * Returns a standalone scale given the specified scale *options*, which must
 * define exactly one named scale. For example, for a default *linear* *color*
 * scale:
 *
 * ```js
 * const color = Plot.scale({color: {type: "linear"}});
 * ```
 */
export function scale(options?: {[name in ScaleName]?: ScaleOptions}): Scale;
