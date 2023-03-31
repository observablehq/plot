import type {ChannelValue, ChannelValueDenseBinSpec, ChannelValueSpec} from "../channel.js";
import type {CurveAutoOptions} from "../curve.js";
import type {Data, MarkOptions, RenderableMark} from "../mark.js";
import type {MarkerOptions} from "../marker.js";
import type {BinOptions, BinReducer} from "../transforms/bin.js";

/** Options for the line mark. */
export interface LineOptions extends MarkOptions, MarkerOptions, CurveAutoOptions {
  /**
   * The required horizontal position channel, typically bound to the *x* scale.
   */
  x?: ChannelValueSpec;

  /**
   * The required vertical position channel, typically bound to the *y* scale.
   */
  y?: ChannelValueSpec;

  /**
   * An optional ordinal channel for grouping data into (possibly stacked)
   * series to be drawn as separate lines. If not specified, it defaults to
   * **fill** if a channel, or **stroke** if a channel.
   */
  z?: ChannelValue;
}

/** Options for the lineX mark. */
export interface LineXOptions extends LineOptions, BinOptions {
  /**
   * The vertical position channel, typically bound to the *y* scale; defaults
   * to the zero-based index of the data [0, 1, 2, …].
   *
   * If an **interval** is specified, **y** values are binned accordingly,
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
   * Plot.lineX(data, {y: "value", interval: 0.5, reduce: "count"})
   * ```
   *
   * To default to zero instead of showing gaps in data, as when the observed
   * value represents a quantity, use the *sum* reducer.
   */
  reduce?: BinReducer;
}

/** Options for the lineY mark. */
export interface LineYOptions extends LineOptions, BinOptions {
  /**
   * The horizontal position channel, typically bound to the *x* scale; defaults
   * to the zero-based index of the data [0, 1, 2, …].
   *
   * If an **interval** is specified, **x** values are binned accordingly,
   * allowing zeroes for empty bins instead of interpolating across gaps. This
   * is recommended to “regularize” sampled data; for example, if your data
   * represents timestamped observations and you expect one observation per day,
   * use *day* as the **interval**.
   */
  x?: ChannelValueDenseBinSpec;

  /**
   * How to reduce **y** values when the **x** channel is binned with an
   * **interval**; defaults to *first*. For example, for a line chart of the
   * count of records by month:
   *
   * ```js
   * Plot.lineY(records, {x: "Date", interval: "month", reduce: "count"})
   * ```
   *
   * To default to zero instead of showing gaps in data, as when the observed
   * value represents a quantity, use the *sum* reducer.
   */
  reduce?: BinReducer;
}

/**
 * Returns a new line for the given *data* and *options* by connecting control
 * points. If neither the **x** nor **y** options are specified, *data* is
 * assumed to be an array of pairs [[*x₀*, *y₀*], [*x₁*, *y₁*], [*x₂*, *y₂*], …]
 * such that **x** = [*x₀*, *x₁*, *x₂*, …] and **y** = [*y₀*, *y₁*, *y₂*, …].
 *
 * Points along the line are connected in input order. If there are multiple
 * series via the **z**, **fill**, or **stroke** channel, series are drawn in
 * input order such that the last series is drawn on top. Typically *data* is
 * already in sorted order, such as chronological for time series; if needed,
 * consider a **sort** transform.
 *
 * If any **x** or **y** values are invalid (undefined, null, or NaN), the line
 * will be interrupted, resulting in a break that divides the line shape into
 * multiple segments. If a line segment consists of only a single point, it may
 * appear invisible unless rendered with rounded or square line caps. In
 * addition, some curves such as *cardinal-open* only render a visible segment
 * if it contains multiple points.
 *
 * Variable aesthetic channels are supported: if the **stroke** is defined as a
 * channel, the line will be broken into contiguous overlapping segments when
 * the stroke color changes; the stroke color will apply to the interval
 * spanning the current data point and the following data point. This behavior
 * also applies to the **fill**, **fillOpacity**, **strokeOpacity**,
 * **strokeWidth**, **opacity**, **href**, **title**, and **ariaLabel**
 * channels. When any of these channels are used, setting an explicit **z**
 * channel (possibly to null) is strongly recommended.
 */
export function line(data?: Data, options?: LineOptions): Line;

/**
 * Like line, except that **x** defaults to the identity function assuming that
 * *data* = [*x₀*, *x₁*, *x₂*, …] and **y** defaults to the zero-based index [0,
 * 1, 2, …]. For example, to draw a vertical line chart of a temperature series:
 *
 * ```js
 * Plot.lineX(observations, {x: "temperature"})
 * ```
 *
 * The **interval** option is recommended to “regularize” sampled data via an
 * implicit binY transform. For example, if your data represents timestamped
 * temperature measurements and you expect one sample per day, use *day* as the
 * interval:
 *
 * ```js
 * Plot.lineX(observations, {y: "date", x: "temperature", interval: "day"})
 * ```
 */
export function lineX(data?: Data, options?: LineXOptions): Line;

/**
 * Like line, except **y** defaults to the identity function and assumes that
 * *data* = [*y₀*, *y₁*, *y₂*, …] and **x** defaults to the zero-based index [0,
 * 1, 2, …]. For example, to draw a horizontal line chart of a temperature
 * series:
 *
 * ```js
 * Plot.lineY(observations, {y: "temperature"})
 * ```
 *
 * The **interval** option is recommended to “regularize” sampled data via an
 * implicit binX transform. For example, if your data represents timestamped
 * temperature measurements and you expect one sample per day, use *day* as the
 * interval:
 *
 * ```js
 * Plot.lineY(observations, {x: "date", y: "temperature", interval: "day"})
 * ```
 */
export function lineY(data?: Data, options?: LineYOptions): Line;

/** The line mark. */
export class Line extends RenderableMark {}
