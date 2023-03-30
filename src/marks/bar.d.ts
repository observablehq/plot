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
   * The rounded corner [*y*-radius[1], either in pixels or as a percentage of
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
   * If the **interval** option is specified, then **x1** and **x2** are derived
   * from **x**, representing the lower and upper bound of the containing
   * interval, respectively. Otherwise, if neither **x1** nor **x2** is
   * specified, an implicit stackX transform is applied and **x** defaults to
   * the identity function, assuming that *data* = [*x₀*, *x₁*, *x₂*, …].
   * Lastly, if only one of **x1** or **x2** is specified, the other defaults to
   * **x**, which defaults to zero.
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
   * If the **interval** option is specified, then **y1** and **y2** are derived
   * from **y**, representing the lower and upper bound of the containing
   * interval, respectively. Otherwise, if neither **y1** nor **y2** is
   * specified, an implicit stackY transform is applied and **y** defaults to
   * the identity function, assuming that *data* = [*y₀*, *y₁*, *y₂*, …].
   * Lastly, if only one of **y1** or **y2** is specified, the other defaults to
   * **y**, which defaults to zero.
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
 * The barX mark draws horizontal bars, rectangles with a vertical ordinal base
 * and an horizontal quantitative extent. For an horizontal bar chart of letter
 * frequencies in English literature:
 *
 * ```js
 * Plot.barX(alphabet, {x: "frequency", y: "letter", fill: "steelblue"})
 * ```
 *
 * The following channels are required:
 *
 * * **x1** - the starting horizontal position; bound to the *x* scale
 * * **x2** - the ending horizontal position; bound to the *x* scale
 *
 * If neither the **x1** nor **x2** option is specified, the **x** option may be
 * specified as shorthand to apply an implicit **stackX** transform; this is the
 * typical configuration for an horizontal bar chart with bars aligned at   *x*
 * = 0. If the **x** option is not specified, it defaults to the identity
 * function. If *options* is undefined, then **y** defaults to the index of
 * *data*; this allows an array of numbers to be passed to Plot.barX to make a
 * quick sequential bar chart:
 *
 * ```js
 * Plot.barX([1, 2, 3, 0, 2])
 * ```
 *
 * If an **interval** is specified, such as *day* or a number, **x1** and **x2**
 * can be derived from **x**.
 *
 * The optional **y** channel specifies the vertical position; bound to the *y*
 * scale, which must be *band*. If the **y** channel is not specified, the bar
 * will span the full vertical extent of the plot (or facet).
 *
 * The **barX** mark is often used in conjunction with the **binY** transform.
 * For a stacked histogram of penguins by species, colored by sex:
 *
 * ```js
 * Plot.barX(*penguins*, Plot.groupY({x: "count"}, {y: "species", fill: "sex"}))
 * ```
 *
 * If the **y** channel is quantitative, consider using the **rectX** mark
 * instead, possibly with a **binY** transform.
 */
export function barX(data?: Data, options?: BarXOptions): BarX;

/**
 * The barY mark draws vertical bars, rectangles with an horizontal ordinal base
 * and a vertical quantitative extent. For a bar chart of letter frequencies in
 * English literature:
 *
 * ```js
 * Plot.barY(alphabet, {x: "letter", y: "frequency", fill: "steelblue"})
 * ```
 *
 * The following channels are required:
 *
 * * **y1** - the starting vertical position; bound to the *y* scale
 * * **y2** - the ending vertical position; bound to the *y* scale
 *
 * If neither the **y1** nor **y2** option is specified, the **y** option may be
 * specified as shorthand to apply an implicit **stackY** transform; this is the
 * typical configuration for a vertical bar chart with bars aligned at *y* = 0.
 * If the **y** option is not specified, it defaults to the identity function.
 * If *options* is undefined, then **x** defaults to the index of *data*; this
 * allows an array of numbers to be passed to Plot.barY to make a quick
 * sequential bar chart:
 *
 * ```js
 * Plot.barY([1, 2, 3, 0, 2])
 * ```
 *
 * If an **interval** is specified, such as *day* or a number, **y1** and **y2**
 * can be derived from **y**.
 *
 * The optional **x** channel specifies the horizontal position; bound to the
 * *x* scale, which must be *band*. If the **x** channel is not specified, the
 * bar will span the full horizontal extent of the plot (or facet).
 *
 * The **barY** mark is often used in conjunction with the **binX** transform.
 * For a stacked histogram of penguins by species, colored by sex:
 *
 * ```js
 * Plot.barY(*penguins*, Plot.groupX({y: "count"}, {x: "species", fill: "sex"}))
 * ```
 *
 * If the **x** channel is quantitative, consider using the **rectY** mark
 * instead, possibly with a **binX** transform.
 */
export function barY(data?: Data, options?: BarYOptions): BarY;

/** The barX mark. */
export class BarX extends RenderableMark {}

/** The barY mark. */
export class BarY extends RenderableMark {}
