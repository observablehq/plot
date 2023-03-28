import type {ChannelValue, ChannelValueDenseBinSpec, ChannelValueSpec} from "../channel.js";
import type {CurveOptions} from "../curve.js";
import type {Data, MarkOptions, RenderableMark} from "../mark.js";
import type {BinOptions, BinReducer} from "../transforms/bin.js";
import type {StackOptions} from "../transforms/stack.js";

/** Options for the area, areaX, and areaY marks. */
export interface AreaOptions extends MarkOptions, StackOptions, CurveOptions {
  /**
   * The vertical position channel for the left side, typically bound to the *x*
   * scale. When used with the **areaY** mark, it is typically equal to **x2**.
   * When used with **areaX** and inferred from the **x** channel, it is
   * typically the position of lower magnitude of the values stacked from zero.
   */
  x1?: ChannelValueSpec;

  /**
   * The vertical position channel for the right side, typically bound to the
   * *x* scale. When used with the **areaY** mark, it is typically equal to
   * **x1**. When used with **areaX** and inferred from the **x** channel, it is
   * typically the position of larger magnitude of the values stacked from zero.
   */
  x2?: ChannelValueSpec;

  /**
   * The horizontal position channel for the bottom, typically bound to the *y*
   * scale. When used with the **areaX** mark, it is typically equal to **y2**.
   * When used with **areaY** and inferred from the **y** channel, it is
   * typically the position of lower magnitude of the values stacked from zero.
   */
  y1?: ChannelValueSpec;

  /**
   * The horizontal position channel for the top, typically bound to the *y*
   * scale. When used with the **areaX** mark, it is typically equal to **y1**.
   * When used with **areaY** and inferred from the **y** channel, it is
   * typically the position of lower magnitude of the values stacked from zero.
   */
  y2?: ChannelValueSpec;

  /**
   * If specified, the **z** channel defines series that generate separate—and
   * possibly stacked—areas.
   */
  z?: ChannelValue;
}

/** Options for the areaX mark. */
export interface AreaXOptions extends Omit<AreaOptions, "y1" | "y2">, BinOptions {
  /**
   * The horizontal position channel, typically bound to the *x* scale.
   */
  x?: ChannelValueSpec;

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
   * Plot.areaX(data, { y: "value", interval: 0.5, reduce: "count" })
   * ```
   */
  reduce?: BinReducer;
}

/** Options for the areaY mark. */
export interface AreaYOptions extends Omit<AreaOptions, "x1" | "x2">, BinOptions {
  /**
   * The vertical position channel, typically bound to the *y* scale.
   */
  x?: ChannelValueDenseBinSpec;

  /**
   * The horizontal position channel, typically bound to the *x* scale. If an
   * interval is specified, the *data* is binned according to the interval,
   * allowing to show zeroes for empty slots, instead of interpolating between
   * defined control points.
   */
  y?: ChannelValueSpec;

  /**
   * Reducer for when the **x** channel is binned with an **interval**. For
   * example, to create a line chart of the count of records by
   * month—showing zeros for empty months:
   *
   * ```js
   * Plot.areaY(records, {x: "Date", interval: "month", reduce: "count"})
   * ```
   */
  reduce?: BinReducer;
}

/**
 * Returns a new area with the given *data* and *options*. Plot.area is rarely
 * used directly; it is only needed when the baseline and topline have neither
 * common *x* nor *y* values. **areaY** is used in the common horizontal
 * orientation where the baseline and topline share *x* values, while **areaX**
 * is used in the vertical orientation where the baseline and topline share *y*
 * values.
 */
export function area(data?: Data, options?: AreaOptions): Area;

/**
 * Returns a new area with the given *data* and *options*. This constructor is
 * used when the baseline and topline share *y* values, as in a time-series area
 * chart where time goes up↑.
 *
 * Separate are are drawn for each series. The optional **z** channel specifies
 * a categorical value to group data into series; if not specified, it defaults
 * to **stroke** if a channel, or **fill** if a channel.
 *
 * If neither the **x1** nor **x2** option is specified, the **x** option may be
 * specified as shorthand to apply an implicit **stackX** transform; this is the
 * typical configuration for an area chart with a baseline at *x* = 0. If the
 * **x** option is not specified, it defaults to the identity function, assuming
 * that *data* = [*x₀*, *x₁*, *x₂*, …]. The **y** option specifies the **y1**
 * channel; and the **y1** and **y2** options are ignored.
 *
 * ```js
 * Plot.areaX(aapl, {y: "Date", x: "Close"})
 * ```
 *
 * If the **interval** option is specified, the **binY** transform is implicitly
 * applied to the specified *options*. The reducer of the output *x* channel may
 * be specified via the **reduce** option, which defaults to *first*. To default
 * to zero instead of showing gaps in data, as when the observed value
 * represents a quantity, use the *sum* reducer.
 *
 * ```js
 * Plot.areaX(observations, {y: "date", x: "temperature", interval: "day"})
 * ```
 *
 * The **interval** option is recommended to “regularize” sampled data; for
 * example, if your data represents timestamped temperature measurements and you
 * expect one sample per day, use "day" as the interval.
 *
 * The areaX mark supports **curve** options to control interpolation between
 * points, and **marker** options to add a marker (such as a dot or an
 * arrowhead) on each of the control points.
 *
 * Variable aesthetics channels are supported: if the **fill** is defined as a
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
 * Returns a new area with the given *data* and *options*. This constructor is
 * used when the baseline and topline share *x* values, as in a time-series area
 * chart where time goes right→.
 *
 * Separate are are drawn for each series. The optional **z** channel specifies
 * a categorical value to group data into series; if not specified, it defaults
 * to **stroke** if a channel, or **fill** if a channel.
 *
 *  If neither the **y1** nor **y2** option is specified, the **y** option may
 * be specified as shorthand to apply an implicit **stackY** transform; this is
 * the typical configuration for an area chart with a baseline at *y* = 0. If
 * the **y** option is not specified, it defaults to the identity function,
 * assuming that *data* = [*y₀*, *y₁*, *y₂*, …]. The **x** option specifies the
 * **x1** channel; and the **x1** and **x2** options are ignored.
 *
 * ```js
 * Plot.areaY(aapl, {x: "Date", y: "Close"})
 * ```
 *
 * If the **interval** option is specified, the **binX** transform is implicitly
 * applied to the specified *options*. The reducer of the output *y* channel may
 * be specified via the **reduce** option, which defaults to *first*. To default
 * to zero instead of showing gaps in data, as when the observed value
 * represents a quantity, use the *sum* reducer.
 *
 * ```js
 * Plot.areaY(observations, {x: "date", y: "temperature", interval: "day"})
 * ```
 *
 * The **interval** option is recommended to “regularize” sampled data; for
 * example, if your data represents timestamped temperature measurements and you
 * expect one sample per day, use "day" as the interval.
 *
 * The areaY mark supports **curve** options to control interpolation between
 * points, and **marker** options to add a marker (such as a dot or an
 * arrowhead) on each of the control points.
 *
 * Variable aesthetics channels are supported: if the **fill** is defined as a
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
