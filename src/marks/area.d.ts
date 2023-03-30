import type {ChannelValue, ChannelValueDenseBinSpec, ChannelValueSpec} from "../channel.js";
import type {CurveOptions} from "../curve.js";
import type {Data, MarkOptions, RenderableMark} from "../mark.js";
import type {BinOptions, BinReducer} from "../transforms/bin.js";
import type {StackOptions} from "../transforms/stack.js";

/** Options for the area, areaX, and areaY marks. */
export interface AreaOptions extends MarkOptions, StackOptions, CurveOptions {
  /**
   * The required primary horizontal position channel, representing the area’s
   * baseline, typically bound to the *x* scale. For areaX, setting this option
   * disables the implicit stackX transform.
   */
  x1?: ChannelValueSpec;

  /**
   * The optional secondary horizontal position channel, representing the area’s
   * topline, typically bound to the *x* scale; if not specified, **x1** is
   * used. For areaX, setting this option disables the implicit stackX
   * transform.
   */
  x2?: ChannelValueSpec;

  /**
   * The required primary vertical position channel, representing the area’s
   * baseline, typically bound to the *y* scale. For areaY, setting this option
   * disables the implicit stackY transform.
   */
  y1?: ChannelValueSpec;

  /**
   * The optional secondary vertical position channel, representing the area’s
   * topline, typically bound to the *y* scale; if not specified, **y1** is
   * used. For areaY, setting this option disables the implicit stackY
   * transform.
   */
  y2?: ChannelValueSpec;

  /**
   * The optional ordinal **z** channel, for grouping data into (possibly
   * stacked) series to be drawn as separate areas. If not specified, it
   * defaults to **fill** if a channel, or **stroke** if a channel.
   */
  z?: ChannelValue;
}

/** Options for the areaX mark. */
export interface AreaXOptions extends Omit<AreaOptions, "y1" | "y2">, BinOptions {
  /**
   * The horizontal position (or length) channel, typically bound to the *x*
   * scale.
   *
   * If neither **x1** nor **x2** is specified, an implicit stackX transform is
   * applied and **x** defaults to the identity function, assuming that *data* =
   * [*x₀*, *x₁*, *x₂*, …]. Otherwise, if only one of **x1** or **x2** is
   * specified, the other defaults to **x**, which defaults to zero.
   */
  x?: ChannelValueSpec;

  /**
   * The vertical position channel, typically bound to the *y* scale; defaults
   * to the zero-based index of the data.
   *
   * If an **interval** is specified, **x** values are binned accordingly,
   * allowing zeroes for empty bins instead of interpolating across gaps. This
   * is recommended to “regularize” sampled data; for example, if your data
   * represents timestamped observations and you expect one observation per day,
   * use *day* as the **interval**.
   */
  y?: ChannelValueDenseBinSpec;

  /**
   * How to reduce **x** values when the **y** channel is binned with an
   * **interval**; defaults to *first*. For example, to create a vertical
   * density plot (count of *y* values binned every 0.5):
   *
   * ```js
   * Plot.areaX(data, {y: "value", interval: 0.5, reduce: "count"})
   * ```
   */
  reduce?: BinReducer;
}

/** Options for the areaY mark. */
export interface AreaYOptions extends Omit<AreaOptions, "x1" | "x2">, BinOptions {
  /**
   * The horizontal position channel, typically bound to the *x* scale; defaults
   * to the zero-based index of the data.
   *
   * If an **interval** is specified, **x** values are binned accordingly,
   * allowing zeroes for empty bins instead of interpolating across gaps. This
   * is recommended to “regularize” sampled data; for example, if your data
   * represents timestamped observations and you expect one observation per day,
   * use *day* as the **interval**.
   */
  x?: ChannelValueDenseBinSpec;

  /**
   * The vertical position (or length) channel, typically bound to the *y*
   * scale.
   *
   * If neither **y1** nor **y2** is specified, an implicit stackY transform is
   * applied and **y** defaults to the identity function, assuming that *data* =
   * [*y₀*, *y₁*, *y₂*, …]. Otherwise, if only one of **y1** or **y2** is
   * specified, the other defaults to **y**, which defaults to zero.
   */
  y?: ChannelValueSpec;

  /**
   * How to reduce **y** values when the **x** channel is binned with an
   * **interval**; defaults to *first*. For example, for an area chart of the
   * count of records by month:
   *
   * ```js
   * Plot.areaY(records, {x: "Date", interval: "month", reduce: "count"})
   * ```
   */
  reduce?: BinReducer;
}

/**
 * Returns a new area with the given *data* and *options*. The area mark is
 * rarely used directly; it is only needed when the baseline and topline have
 * neither *x* nor *y* values in common. Use areaY for a horizontal orientation
 * where the baseline and topline share *x* values, or areaX for a vertical
 * orientation where the baseline and topline share *y* values.
 */
export function area(data?: Data, options?: AreaOptions): Area;

/**
 * Returns a new vertically-oriented area for the given *data* and *options*,
 * where the baseline and topline share **y** values, as in a time-series area
 * chart where time goes up↑.
 *
 * ```js
 * Plot.areaX(aapl, {y: "Date", x: "Close"})
 * ```
 *
 * Variable aesthetic channels are supported: if the **fill** is defined as a
 * channel, the area will be broken into contiguous overlapping sections when
 * the fill color changes; the fill color will apply to the interval spanning
 * the current data point and the following data point. This behavior also
 * applies to the **fillOpacity**, **stroke**, **strokeOpacity**,
 * **strokeWidth**, **opacity**, **href**, **title**, and **ariaLabel**
 * channels. When any of these channels are used, setting an explicit **z**
 * channel (possibly to null) is strongly recommended.
 */
export function areaX(data?: Data, options?: AreaXOptions): Area;

/**
 * Returns a new horizontall-oriented area for the given *data* and *options*,
 * where the baseline and topline share **x** values, as in a time-series area
 * chart where time goes right→.
 *
 * ```js
 * Plot.areaY(aapl, {x: "Date", y: "Close"})
 * ```
 *
 * Variable aesthetic channels are supported: if the **fill** is defined as a
 * channel, the area will be broken into contiguous overlapping sections when
 * the fill color changes; the fill color will apply to the interval spanning
 * the current data point and the following data point. This behavior also
 * applies to the **fillOpacity**, **stroke**, **strokeOpacity**,
 * **strokeWidth**, **opacity**, **href**, **title**, and **ariaLabel**
 * channels. When any of these channels are used, setting an explicit **z**
 * channel (possibly to null) is strongly recommended.
 */
export function areaY(data?: Data, options?: AreaYOptions): Area;

/** The area mark. */
export class Area extends RenderableMark {}
