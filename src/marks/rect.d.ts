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
   * The **x1** channel or constant describes the left edge of the rect. Note
   * that if x2 < x1 the positions are swapped, so that the rect is always
   * defined.
   */
  x1?: ChannelValueSpec;

  /**
   * The **x2** channel or constant describes the right edge of the rect.
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
   * The **y1** channel or constant describes the bottom edge of the rect. Note
   * that if y2 < y1 the positions are swapped, so that the rect is always
   * defined.
   */
  y1?: ChannelValueSpec;

  /**
   * The **y2** channel or constant describes the top edge of the rect.
   */
  y2?: ChannelValueSpec;

  /**
   * An interval used to derive the **x1** and **x2** channels from **x**, and
   * the **y1** and **y2** channels from **y**. If both **x** and **y** are
   * defined this way, and you want a different interval on each axis, use the
   * {value, interval} channel syntax.
   *
   * For example, to display a continuous checkerboard pattern:
   *
   * ```js
   * Plot.rect(d3.cross("12345678", "12345678"), {
   *   x: ([i, j]) => i,
   *   y: ([i, j]) => j,
   *   interval: 1,
   *   fill: ([i, j]) => i % 2 ^ j % 2
   * })
   * ```
   */
  interval?: Interval;

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
