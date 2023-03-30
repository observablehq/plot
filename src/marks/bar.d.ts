import type {ChannelValueIntervalSpec, ChannelValueSpec} from "../channel.js";
import type {Interval} from "../interval.js";
import type {InsetOptions} from "../inset.js";
import type {Data, MarkOptions, RenderableMark} from "../mark.js";
import type {StackOptions} from "../transforms/stack.js";

/** Options for the barX and barY marks. */
interface BarOptions extends MarkOptions, InsetOptions, StackOptions {
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

  /**
   * How to convert a continuous value (**x** for barX, or **y** for barY) into
   * an interval (**x1** and **x2** for barX, or **y1** and **y2** for barY);
   * one of:
   *
   * - an object that implements *floor*, *offset*, and *range* methods
   * - a named time interval such as *day* (for date intervals)
   * - a number (for number intervals), defining intervals at integer multiples of *n*
   *
   * For example, for a scatterplot showing the frequency distribution of
   * English letters, where the vertical extent of each bar covers a unit
   * percentage:
   *
   * ```js
   * Plot.barY(alphabet, {x: "letter", y: "frequency", interval: 0.01})
   * ```
   *
   * Setting this option disables the implicit stack transform (stackX or barX,
   * or stackY for barY).
   */
  interval?: Interval;
}

/** Options for the barX mark. */
export interface BarXOptions extends BarOptions {
  /**
   * The horizontal position (or length/width) channel, typically bound to the
   * *x* scale.
   *
   * If neither **x1** nor **x2** nor **interval** is specified, an implicit
   * stackX transform is applied and **x** defaults to the identity function,
   * assuming that *data* = [*x₀*, *x₁*, *x₂*, …]. Otherwise if an **interval**
   * is specified, then **x1** and **x2** are derived from **x**, representing
   * the lower and upper bound of the containing interval, respectively.
   * Otherwise, if only one of **x1** or **x2** is specified, the other defaults
   * to **x**, which defaults to zero.
   */
  x?: ChannelValueIntervalSpec;

  /**
   * The required primary (starting) horizontal position channel, typically
   * bound to the *x* scale. Setting this option disables the implicit stackX
   * transform.
   */
  x1?: ChannelValueSpec;

  /**
   * The required secondary (ending) horizontal position channel, typically
   * bound to the *x* scale. Setting this option disables the implicit stackX
   * transform.
   */
  x2?: ChannelValueSpec;

  /**
   * The optional vertical position of the bar; a categorical channel typically
   * bound to the *y* scale. If not specified, the bar spans the vertical extent
   * of the frame; otherwise the *y* scale must be a *band* scale.
   *
   * If *y* represents quantitative or temporal values, use a rectX mark
   * instead.
   */
  y?: ChannelValueSpec;
}

/** Options for the barY mark. */
export interface BarYOptions extends BarOptions {
  /**
   * The vertical position (or length/height) channel, typically bound to the
   * *y* scale.
   *
   * If neither **y1** nor **y2** nor **interval** is specified, an implicit
   * stackY transform is applied and **y** defaults to the identity function,
   * assuming that *data* = [*y₀*, *y₁*, *y₂*, …]. Otherwise if an **interval**
   * is specified, then **y1** and **y2** are derived from **y**, representing
   * the lower and upper bound of the containing interval, respectively.
   * Otherwise, if only one of **y1** or **y2** is specified, the other defaults
   * to **y**, which defaults to zero.
   */
  y?: ChannelValueIntervalSpec;

  /**
   * The required primary (starting) vertical position channel, typically bound
   * to the *y* scale. Setting this option disables the implicit stackY
   * transform.
   */
  y1?: ChannelValueSpec;

  /**
   * The required secondary (ending) horizontal position channel, typically
   * bound to the *y* scale. Setting this option disables the implicit stackY
   * transform.
   */
  y2?: ChannelValueSpec;

  /**
   * The optional horizontal position of the bar; a categorical channel
   * typically bound to the *x* scale. If not specified, the bar spans the
   * horizontal extent of the frame; otherwise the *x* scale must be a *band*
   * scale.
   *
   * If *x* represents quantitative or temporal values, use a rectY mark
   * instead.
   */
  x?: ChannelValueSpec;
}

/**
 * Returns a new horizontal bar mark for the given *data* and *options*; the
 * required *x* values must be quantitative, and the optional *y* values must be
 * ordinal. For example, for a horizontal bar chart of English letter frequency:
 *
 * ```js
 * Plot.barX(alphabet, {x: "frequency", y: "letter"})
 * ```
 *
 * If neither **x1** nor **x2** nor **interval** is specified, an implicit
 * stackX transform is applied and **x** defaults to the identity function,
 * assuming that *data* = [*x₀*, *x₁*, *x₂*, …]. Otherwise if an **interval** is
 * specified, then **x1** and **x2** are derived from **x**, representing the
 * lower and upper bound of the containing interval, respectively. Otherwise, if
 * only one of **x1** or **x2** is specified, the other defaults to **x**, which
 * defaults to zero.
 *
 * The optional **y** ordinal channel specifies the vertical position; it is
 * typically bound to the *y* scale, which must be a *band* scale. If the **y**
 * channel is not specified, the bar will span the vertical extent of the plot’s
 * frame. The barX mark is often used in conjunction with the groupY transform.
 * For a stacked histogram of penguins by species, colored by sex:
 *
 * ```js
 * Plot.barX(penguins, Plot.groupY({x: "count"}, {y: "species", fill: "sex"}))
 * ```
 *
 * If *y* is quantitative, use the rectX mark instead, possibly with a binY
 * transform.
 *
 * If *options* is undefined, then **y** defaults to the zero-based index of
 * *data* [0, 1, 2, …], allowing a quick bar chart from an array of numbers:
 *
 * ```js
 * Plot.barX([4, 9, 24, 46, 66, 7])
 * ```
 */
export function barX(data?: Data, options?: BarXOptions): BarX;

/**
 * Returns a new vertical bar mark for the given *data* and *options*; the
 * required *y* values must be quantitative, and the optional *x* values must be
 * ordinal. For example, for a vertical bar chart of English letter frequency:
 *
 * ```js
 * Plot.barY(alphabet, {y: "frequency", x: "letter"})
 * ```
 * If neither **y1** nor **y2** nor **interval** is specified, an implicit
 * stackY transform is applied and **y** defaults to the identity function,
 * assuming that *data* = [*y₀*, *y₁*, *y₂*, …]. Otherwise if an **interval** is
 * specified, then **y1** and **y2** are derived from **y**, representing the
 * lower and upper bound of the containing interval, respectively. Otherwise, if
 * only one of **y1** or **y2** is specified, the other defaults to **y**, which
 * defaults to zero.
 *
 * The optional **x** ordinal channel specifies the horizontal position; it is
 * typically bound to the *x* scale, which must be a *band* scale. If the **x**
 * channel is not specified, the bar will span the horizontal extent of the
 * plot’s frame. The barY mark is often used in conjunction with the groupX
 * transform. For a stacked histogram of penguins by species, colored by sex:
 *
 * ```js
 * Plot.barY(penguins, Plot.groupX({y: "count"}, {x: "species", fill: "sex"}))
 * ```
 *
 * If *x* is quantitative, use the rectY mark instead, possibly with a binX
 * transform.
 *
 * If *options* is undefined, then **x** defaults to the zero-based index of
 * *data* [0, 1, 2, …], allowing a quick bar chart from an array of numbers:
 *
 * ```js
 * Plot.barY([4, 9, 24, 46, 66, 7])
 * ```
 */
export function barY(data?: Data, options?: BarYOptions): BarY;

/** The barX mark. */
export class BarX extends RenderableMark {}

/** The barY mark. */
export class BarY extends RenderableMark {}
