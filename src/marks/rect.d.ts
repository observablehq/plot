import type {ChannelValueIntervalSpec, ChannelValueSpec} from "../channel.js";
import type {InsetOptions} from "../inset.js";
import type {Interval} from "../interval.js";
import type {Data, MarkOptions, RenderableMark} from "../mark.js";
import type {StackOptions} from "../transforms/stack.js";

/** Options for the rect mark. */
export interface RectOptions extends MarkOptions, InsetOptions, StackOptions {
  /**
   * The horizontal position (or length/width) channel, typically bound to the
   * *x* scale.
   *
   * If an **interval** is specified, then **x1** and **x2** are derived from
   * **x**, representing the lower and upper bound of the containing interval,
   * respectively. For example, for a vertical bar chart of items sold by day:
   *
   * ```js
   * Plot.rectY(sales, {x: "date", interval: "day", y2: "items"})
   * ```
   *
   * If *x* represents ordinal values, use a bar or cell mark instead.
   */
  x?: ChannelValueIntervalSpec;

  /**
   * The required primary (starting, often left) horizontal position channel,
   * typically bound to the *x* scale. Setting this option disables the rectX
   * mark’s implicit stackX transform.
   *
   * If *x* represents ordinal values, use a bar or cell mark instead.
   */
  x1?: ChannelValueSpec;

  /**
   * The required secondary (ending, often right) horizontal position channel,
   * typically bound to the *x* scale. Setting this option disables the rectX
   * mark’s implicit stackX transform.
   *
   * If *x* represents ordinal values, use a bar or cell mark instead.
   */
  x2?: ChannelValueSpec;

  /**
   * The vertical position (or length/height) channel, typically bound to the
   * *y* scale.
   *
   * If an **interval** is specified, then **y1** and **y2** are derived from
   * **y**, representing the lower and upper bound of the containing interval,
   * respectively. For example, for a horizontal bar chart of items sold by day:
   *
   * ```js
   * Plot.rectX(sales, {y: "date", interval: "day", x2: "items"})
   * ```
   *
   * If *y* represents ordinal values, use a bar or cell mark instead.
   */
  y?: ChannelValueIntervalSpec;

  /**
   * The required primary (starting, often bottom) vertical position channel,
   * typically bound to the *y* scale. Setting this option disables the rectY
   * mark’s implicit stackY transform.
   *
   * If *y* represents ordinal values, use a bar or cell mark instead.
   */
  y1?: ChannelValueSpec;

  /**
   * The required secondary (ending, often top) vertical position channel,
   * typically bound to the *y* scale. Setting this option disables the rectY
   * mark’s implicit stackY transform.
   *
   * If *y* represents ordinal values, use a bar or cell mark instead.
   */
  y2?: ChannelValueSpec;

  /**
   * How to convert a continuous value (**x** for rectY, **y** for rectX, or
   * both for rect) into an interval (**x1** and **x2** for rectY, or **y1** and
   * **y2** for rectX, or both for rect); one of:
   *
   * - an object that implements *floor*, *offset*, and *range* methods
   * - a named time interval such as *day* (for date intervals)
   * - a number (for number intervals), defining intervals at integer multiples of *n*
   *
   * For example, for a scatterplot of penguin culmen length *vs.* depth, using
   * rects of half-millimeter width and height:
   *
   * ```js
   * Plot.rect(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm", interval: 0.5})
   * ```
   *
   * Setting this option disables the implicit stack transform (stackX for rectX,
   * or stackY for rectY).
   */
  interval?: Interval;

  /**
   * The rounded corner [*x*-radius][1], either in pixels or as a percentage of
   * the bar width. If **rx** is not specified, it defaults to **ry** if
   * present, and otherwise draws square corners.
   *
   * [1]: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/rx
   */
  rx?: number | string;

  /**
   * The rounded corner [*y*-radius][1], either in pixels or as a percentage of
   * the bar height. If **ry** is not specified, it defaults to **rx** if
   * present, and otherwise draws square corners.
   *
   * [1]: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/ry
   */
  ry?: number | string;
}

/** Options for the rectX mark. */
export interface RectXOptions extends RectOptions {
  /**
   * The horizontal position (or length/width) channel, typically bound to the
   * *x* scale.
   *
   * If neither **x1** nor **x2** is specified, an implicit stackX transform is
   * applied and **x** defaults to the identity function, assuming that *data* =
   * [*x₀*, *x₁*, *x₂*, …]. Otherwise, if only one of **x1** or **x2** is
   * specified, the other defaults to **x**, which defaults to zero.
   */
  x?: ChannelValueSpec; // disallow x interval
}

/** Options for the rectY mark. */
export interface RectYOptions extends RectOptions {
  /**
   * The vertical position (or length/height) channel, typically bound to the
   * *y* scale.
   *
   * If neither **y1** nor **y2** is specified, an implicit stackY transform is
   * applied and **y** defaults to the identity function, assuming that *data* =
   * [*y₀*, *y₁*, *y₂*, …]. Otherwise, if only one of **y1** or **y2** is
   * specified, the other defaults to **y**, which defaults to zero.
   */
  y?: ChannelValueSpec; // disallow y interval
}

/**
 * Returns a rect mark for the given *data* and *options*. The rectangle extends
 * horizontally from **x1** to **x2**, and vertically from **y1** to **y2**. The
 * position channels are often derived with a transform. For example, to create
 * a heatmap of athletes, binned by weight and height:
 *
 * ```js
 * Plot.rect(athletes, Plot.bin({fill: "proportion"}, {x: "weight", y: "height"}))
 * ```
 *
 * When **y** extends from zero, for example for a histogram where the height of
 * each rect reflects a count of values, use the rectY mark for an implicit
 * stackY transform; similarly, if **x** extends from zero, use the rectX mark
 * for an implicit stackX transform.
 *
 * If an **interval** is specified, then **x1** and **x2** are derived from
 * **x**, and **y1** and **y2** are derived from **y**, each representing the
 * lower and upper bound of the containing interval, respectively.
 *
 * Both *x* and *y* should be quantitative or temporal; otherwise, use a bar or
 * cell mark.
 */
export function rect(data?: Data, options?: RectOptions): Rect;

/**
 * Like rect, but if neither **x1** nor **x2** is specified, an implicit stackX
 * transform is applied to **x**, and if **x** is not specified, it defaults to
 * the identity function, assuming that *data* is an array of numbers [*x₀*,
 * *x₁*, *x₂*, …]. For example, for a vertical histogram of athletes by height
 * with rects aligned at *x* = 0:
 *
 * ```js
 * Plot.rectX(olympians, Plot.binY({x: "count"}, {y: "height"}))
 * ```
 */
export function rectX(data?: Data, options?: RectXOptions): Rect;

/**
 * Like rect, but if neither **y1** nor **y2** is specified, apply an implicit
 * stackY transform is applied to **y**, and if **y** is not specified, it
 * defaults to the identity function, assuming that *data* is an array of
 * numbers [*y₀*, *y₁*, *y₂*, …]. For example, for a horizontal histogram of
 * athletes by weight with rects aligned at *y* = 0:
 *
 * ```js
 * Plot.rectY(olympians, Plot.binX({y: "count"}, {x: "weight"}))
 * ```
 */
export function rectY(data?: Data, options?: RectYOptions): Rect;

/** The rect mark. */
export class Rect extends RenderableMark {}
