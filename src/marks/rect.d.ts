import type {ChannelValueIntervalSpec, ChannelValueSpec} from "../channel.js";
import type {InsetOptions} from "../inset.js";
import type {Interval} from "../interval.js";
import type {Data, MarkOptions, RenderableMark} from "../mark.js";
import type {StackOptions} from "../transforms/stack.js";

/** Options for the rect mark. */
export interface RectOptions extends MarkOptions, InsetOptions, StackOptions {
  /**
   * A {value, interval} channel defining derived **x1** and **x2** channels;
   * for example, to make timestamps extend from the start to the end of the
   * day:
   *
   * ```js
   * Plot.rect(sales, {x: {value: "date", interval: "day"}, y1: 0, y2: "items"})
   * ```
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
   * A {value, interval} channel defining derived **y1** and **y2** channels;
   * for example, to represent values as bars of height 1 rounded to the closest
   * integer:
   *
   * ```js
   * Plot.rect(sales, {x: "date", y: {value: "items", interval: 1}})
   * ```
   */
  y?: ChannelValueIntervalSpec;

  /**
   * The **y1** channel or constant describes the bottom edge of the rect.
   */
  y1?: ChannelValueSpec;

  /**
   * The **y2** channel or constant describes the top edge of the rect.
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
  x?: ChannelValueSpec; // disallow x interval
}

/** Options for the rectY mark. */
export interface RectYOptions extends RectOptions {
  y?: ChannelValueSpec; // disallow y interval
}

/**
 * Returns a rect mark for the given *data* and *options*. The shape extends
 * horizontally from **x1** to **x2**, and vertically from **y1** to **y2**. The
 * position channels can be specified directly, but they are often derived with
 * a transform, or with an interval. For example, to create a heatmap of
 * athletes, binned by weight and height:
 *
 * ```js
 * Plot.rect(athletes, Plot.bin({fill: "proportion"}, {x: "weight", y: "height"}))
 * ```
 *
 * When a dimension extends from zero, for example for a histogram where the
 * height of each bin reflects a count of values, prefer the rectY mark, which
 * includes a stack transform; similarly, prefer the rectX mark if the width
 * extends from zero.
 */
export function rect(data?: Data, options?: RectOptions): Rect;

/**
 * Like rect, but if neither the **x1** nor **x2** option is specified, the
 * **x** option may be specified as shorthand to apply an implicit **stackX**
 * transform; this is the typical configuration for a histogram with rects
 * aligned at *x* = 0.
 *
 * For example, to create a vertical histogram of athletes by height:
 *
 * ```js
 * Plot.rectX(olympians, Plot.binY({ x: "count" }, { y: "height" }))
 * ```
 *
 * If the **x** option is not specified, it defaults to the identity function,
 * assuming that *data* is an array of numbers [*x₀*, *x₁*, *x₂*, …].
 */
export function rectX(data?: Data, options?: RectXOptions): Rect;

/**
 * Like rect, but if neither the **y1** nor **y2** option is specified, the
 * **y** option may be specified as shorthand to apply an implicit **stackY**
 * transform; this is the typical configuration for a histogram with rects
 * aligned at *y* = 0.
 *
 * For example, to create a horizontal histogram of athletes by weight:
 *
 * ```js
 * Plot.rectY(olympians, Plot.binX({ y: "count" }, { x: "weight" }))
 * ```
 *
 * If the **y** option is not specified, it defaults to the identity function,
 * assuming that *data* is an array of numbers [*y₀*, *y₁*, *y₂*, …].
 */
export function rectY(data?: Data, options?: RectYOptions): Rect;

/** The rect mark. */
export class Rect extends RenderableMark {}
