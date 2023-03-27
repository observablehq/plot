import type {ChannelValueIntervalSpec, ChannelValueSpec} from "../channel.js";
import type {Interval} from "../interval.js";
import type {InsetOptions} from "../inset.js";
import type {Data, MarkOptions, RenderableMark} from "../mark.js";
import type {StackOptions} from "../transforms/stack.js";

/** Options for the barX and barY marks. */
interface BarOptions extends MarkOptions, InsetOptions, StackOptions {

  /**
   * The [*x* radius][1] for rounded corners.
   *
   * [1]: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/rx
   */
  rx?: number | string;

  /**
   * The [*y* radius][1] for rounded corners.
   *
   * [1]: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/ry
   */
  ry?: number | string;
}

/** Options for the barX mark. */
export interface BarXOptions extends BarOptions {
  /**
   * The bar’s width as a quantitative channel, bound to the *x* scale. The
   * implicit **stackX** transform stacks bars horizontally.
   */
  x?: ChannelValueIntervalSpec;

  /** The bar’s starting position, bound to the *x* scale. */
  x1?: ChannelValueSpec;

  /** The bar’s ending position, bound to the *x* scale. */
  x2?: ChannelValueSpec;

  /** The bar’s horizontal position, bound to the *y* band scale. */
  y?: ChannelValueSpec;

  /**
   * If an **interval** is specified, such as *day* or a number, **x1** and
   * **x2** can be derived from **x**: the interval’s floor is invoked for each
   * *x* to produce *x1*, and its offset is invoked for each *x1* to produce
   * *x2*. If the interval is specified as a number *n*, *x1* and *x2* are taken
   * as the two consecutive multiples of *n* that bracket *x*.
   */
  interval?: Interval;
}

/** Options for the barY mark. */
export interface BarYOptions extends BarOptions {
  /**
   * The bar’s height as a quantitative channel, bound to the *y* scale. The
   * implicit **stackY** transform stacks bars vertically.
   */
  y?: ChannelValueIntervalSpec;
  y1?: ChannelValueSpec;
  y2?: ChannelValueSpec;
  x?: ChannelValueSpec;

  /**
   * If an **interval** is specified, such as *day* or a number, **y1** and
   * **y2** can be derived from **y**: the interval’s floor is invoked for each
   * *y* to produce *y1*, and its offset is invoked for each *y1* to produce
   * *y2*. If the interval is specified as a number *n*, *y1* and *y2* are taken
   * as the two consecutive multiples of *n* that bracket *x*.
   */
  interval?: Interval;
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
