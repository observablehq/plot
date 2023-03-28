import type {ChannelValue, ChannelValueDenseBinSpec, ChannelValueSpec} from "../channel.js";
import type {CurveAutoOptions} from "../curve.js";
import type {Data, MarkOptions, RenderableMark} from "../mark.js";
import type {MarkerOptions} from "../marker.js";
import type {BinOptions, BinReducer} from "../transforms/bin.js";

/** Options for the line mark. */
export interface LineOptions extends MarkOptions, MarkerOptions, CurveAutoOptions {
  /**
   * The horizontal position channel, typically bound to the *x* scale.
   */
  x?: ChannelValueSpec;

  /**
   * The vertical position channel, typically bound to the *y* scale.
   */
  y?: ChannelValueSpec;

  /**
   * If specified, the **z** channel defines series, creating separate lines.
   */
  z?: ChannelValue;
}

/** Options for the lineX mark. */
export interface LineXOptions extends LineOptions, BinOptions {
  /**
   * The vertical position channel, typically bound to the *y* scale. If an
   * interval is specified, the *data* is binned according to the interval,
   * allowing to show zeroes for empty slots, instead of interpolating between
   * defined control points.
   */
  y?: ChannelValueDenseBinSpec;

  /**
   * Reducer for when the **y** channel is binned with an **interval**. For
   * example, to create a vertical density plot (count of *y* values binned
   * every 0.5):
   *
   * ```js
   * Plot.lineX(data, { y: "value", interval: 0.5, reduce: "count" })
   * ```
   */
  reduce?: BinReducer;
}

/** Options for the lineY mark. */
export interface LineYOptions extends LineOptions, BinOptions {
  /**
   * The horizontal position channel, typically bound to the *x* scale. If an
   * interval is specified, the *data* is binned according to the interval,
   * allowing to show zeroes for empty slots, instead of interpolating between
   * defined control points.
   */
  x?: ChannelValueDenseBinSpec;

  /**
   * Reducer for when the **x** channel is binned with an **interval**. For
   * example, to create a line chart of the count of records by
   * month—showing zeros for empty months:
   *
   * ```js
   * Plot.lineY(records, {x: "Date", interval: "month", reduce: "count"})
   * ```
   */
  reduce?: BinReducer;
}

/**
 * Draws two-dimensional lines by connecting control points.
 *
 * The following channels are required:
 *
 * - **x** - the horizontal position of control points; bound to the *x* scale
 * - **y** - the vertical position of control points; bound to the *y* scale
 *
 * Separate lines are drawn for each series. The optional **z** channel
 * specifies a categorical value to group data into series; if not specified, it
 * defaults to **stroke** if a channel, or **fill** if a channel.
 *
 * The **fill** defaults to none. The **stroke** defaults to currentColor if the
 * fill is none, and to none otherwise. If the stroke is defined as a channel,
 * the line will be broken into contiguous overlapping segments when the stroke
 * color changes; the stroke color will apply to the interval spanning the
 * current data point and the following data point. This behavior also applies
 * to the **fill**, **fillOpacity**, **strokeOpacity**, **strokeWidth**,
 * **opacity**, **href**, **title**, and **ariaLabel** channels. When any of
 * these channels are used, setting an explicit **z** channel (possibly to null)
 * is strongly recommended. The **strokeWidth** defaults to 1.5, the
 * **strokeLinecap** and **strokeLinejoin** default to *round*, and the
 * **strokeMiterlimit** defaults to 1.
 *
 * Points along the line are connected in input order. Likewise, if there are
 * multiple series via the *z*, *fill*, or *stroke* channel, the series are
 * drawn in input order such that the last series is drawn on top. Typically,
 * the data is already in sorted order, such as chronological for time series;
 * if sorting is needed, consider a **sort** transform.
 *
 * The line mark supports **curve** options to control interpolation between
 * points, and **marker** options to add a marker (such as a dot or an
 * arrowhead) on each of the control points. The default curve is *auto*, which
 * is equivalent to *linear* if there is no projection, and otherwise uses the
 * associated projection. If any of the *x* or *y* values are invalid
 * (undefined, null, or NaN), the line will be interrupted, resulting in a break
 * that divides the line shape into multiple segments. If a line segment
 * consists of only a single point, it may appear invisible unless rendered with
 * rounded or square line caps. In addition, some curves such as *cardinal-open*
 * only render a visible segment if it contains multiple points.
 *
 * If neither the **x** nor **y** options are specified, *data* is assumed to be
 * an array of pairs [[*x₀*, *y₀*], [*x₁*, *y₁*], [*x₂*, *y₂*], …] such that
 * **x** = [*x₀*, *x₁*, *x₂*, …] and **y** = [*y₀*, *y₁*, *y₂*, …].
 */
export function line(data?: Data, options?: LineOptions): Line;

/**
 * Similar to **line** except that if the **x** option is not specified, it
 * defaults to the identity function and assumes that *data* = [*x₀*, *x₁*,
 * *x₂*, …]. If the **y** option is not specified, it defaults to [0, 1, 2, …].
 * For example, the following draws a vertical line chart of a temperature
 * series:
 *
 * ```js
 * Plot.lineX(observations.map(d => d.temperature))
 * ```
 *
 * If the **interval** option is specified, the **binY** transform is implicitly
 * applied to the specified *options*. The reducer of the output *x* channel may
 * be specified via the **reduce** option, which defaults to *first*. To default
 * to zero instead of showing gaps in data, as when the observed value
 * represents a quantity, use the *sum* reducer.
 *
 * The **interval** option is recommended to “regularize” sampled data; for
 * example, if your data represents timestamped temperature measurements and you
 * expect one sample per day, use "day" as the interval:
 *
 * ```js
 * Plot.lineX(observations, {y: "date", x: "temperature", interval: "day"})
 * ```
 */
export function lineX(data?: Data, options?: LineXOptions): Line;

/**
 * Similar to **line** except that if the **y** option is not specified, it
 * defaults to the identity function and assumes that *data* = [*y₀*, *y₁*,
 * *y₂*, …]. If the **x** option is not specified, it defaults to [0, 1, 2, …].
 * For example, the following draws a horizontal line chart of a temperature
 * series:
 *
 * ```js
 * Plot.lineY(observations.map(d => d.temperature))
 * ```
 *
 * If the **interval** option is specified, the **binX** transform is implicitly
 * applied to the specified *options*. The reducer of the output *y* channel may
 * be specified via the **reduce** option, which defaults to *first*. To default
 * to zero instead of showing gaps in data, as when the observed value
 * represents a quantity, use the *sum* reducer.
 *
 * The **interval** option is recommended to “regularize” sampled data; for
 * example, if your data represents timestamped temperature measurements and you
 * expect one sample per day, use "day" as the interval:
 *
 * ```js
 * Plot.lineY(observations, {x: "date", y: "temperature", interval: "day"})
 * ```
 */
export function lineY(data?: Data, options?: LineYOptions): Line;

/** The line mark. */
export class Line extends RenderableMark {}
