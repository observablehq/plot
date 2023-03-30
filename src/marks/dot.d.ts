import type {ChannelValue, ChannelValueIntervalSpec, ChannelValueSpec} from "../channel.js";
import type {Interval} from "../interval.js";
import type {Data, FrameAnchor, MarkOptions, RenderableMark} from "../mark.js";
import type {SymbolType} from "../symbol.js";

/** Options for the dot mark. */
export interface DotOptions extends MarkOptions {
  /**
   * The horizontal position channel specifying the dot’s center, typically
   * bound to the *x* scale.
   */
  x?: ChannelValueSpec;

  /**
   * The vertical position channel specifying the dot’s center, typically bound
   * to the *y* scale.
   */
  y?: ChannelValueSpec;

  /**
   * The radius of dots; either a channel or constant. When a number, it is
   * interpreted as a constant radius in pixels. Otherwise it is interpreted as
   * a channel, typically bound to the *r* channel, which defaults to the *sqrt*
   * type for proportional symbols. The radius defaults to 4.5 pixels when using
   * the **symbol** channel, and otherwise 3 pixels. Dots with a nonpositive
   * radius are not drawn.
   */
  r?: ChannelValueSpec | number;

  /**
   * The rotation angle of dots in degrees clockwise; either a channel or a
   * constant. When a number, it is interpreted as a constant; otherwise it is
   * interpreted as a channel. Defaults to 0°, pointing up.
   */
  rotate?: ChannelValue | number;

  /**
   * The categorical symbol; either a channel or a constant. A constant symbol
   * can be specified by a valid symbol name such as *star*, or a symbol object
   * (implementing the draw method); otherwise it is interpreted as a channel.
   * Defaults to *circle* for the **dot** mark, and *hexagon* for the
   * **hexagon** mark.
   *
   * If the **symbol** channel’s values are all symbols, symbol names, or
   * nullish, the channel is unscaled (values are interpreted literally);
   * otherwise, the channel is bound to the *symbol* scale.
   */
  symbol?: ChannelValueSpec | SymbolType;

  /**
   * The frame anchor specifies defaults for **x** and **y** based on the plot’s
   * frame; it may be one of the four sides (*top*, *right*, *bottom*, *left*),
   * one of the four corners (*top-left*, *top-right*, *bottom-right*,
   * *bottom-left*), or the *middle* of the frame. For example, for dots
   * distributed horizontally at the top of the frame:
   *
   * ```js
   * Plot.dot(data, {x: "date", frameAnchor: "top"})
   * ```
   */
  frameAnchor?: FrameAnchor;
}

/** Options for the dotX mark. */
export interface DotXOptions extends Omit<DotOptions, "y"> {
  /**
   * The vertical position of the dot’s center, typically bound to the *y*
   * scale.
   */
  y?: ChannelValueIntervalSpec;

  /**
   * An interval (such as *day* or a number), to transform **y** values to the
   * middle of the interval.
   */
  interval?: Interval;
}

/** Options for the dotY mark. */
export interface DotYOptions extends Omit<DotOptions, "x"> {
  /**
   * The horizontal position of the dot’s center, typically bound to the *x*
   * scale.
   */
  x?: ChannelValueIntervalSpec;

  /**
   * An interval (such as *day* or a number), to transform **x** values to the
   * middle of the interval.
   */
  interval?: Interval;
}

/**
 * Returns a new dot mark for the given *data* and *options* that draws circles,
 * or other symbols, as in a scatterplot. For example, a scatterplot of sales by
 * fruit type (category) and units sold (quantitative):
 *
 * ```js
 * Plot.dot(sales, {x: "units", y: "fruit"})
 * ```
 *
 * If either **x** or **y** is not specified, the default is determined by the
 * **frameAnchor** option. If none of **x**, **y**, and **frameAnchor** are
 * specified, *data* is assumed to be an array of pairs [[*x₀*, *y₀*], [*x₁*,
 * *y₁*], [*x₂*, *y₂*], …] such that **x** = [*x₀*, *x₁*, *x₂*, …] and **y** =
 * [*y₀*, *y₁*, *y₂*, …].
 *
 * Dots are sorted by descending radius **r** by default to mitigate
 * overplotting; set the **sort** option to null to draw them in input order.
 */
export function dot(data?: Data, options?: DotOptions): Dot;

/**
 * Like dot, except that **x** defaults to the identity function, assuming that
 * *data* = [*x₀*, *x₁*, *x₂*, …].
 *
 * ```js
 * Plot.dotX(cars.map(d => d["economy (mpg)"]))
 * ```
 *
 * If an **interval** is specified, such as *day*, **y** is transformed to the
 * middle of the interval.
 */
export function dotX(data?: Data, options?: DotXOptions): Dot;

/**
 * Like dot, except that **y** defaults to the identity function, assuming that
 * *data* = [*y₀*, *y₁*, *y₂*, …].
 *
 * ```js
 * Plot.dotY(cars.map(d => d["economy (mpg)"]))
 * ```
 *
 * If an **interval** is specified, such as *day*, **x** is transformed to the
 * middle of the interval.
 */
export function dotY(data?: Data, options?: DotYOptions): Dot;

/** Like dot, except that the **symbol** option is set to *circle*. */
export function circle(data?: Data, options?: Exclude<DotOptions, "symbol">): Dot;

/** Like dot, except that the **symbol** option is set to *hexagon*. */
export function hexagon(data?: Data, options?: Exclude<DotOptions, "symbol">): Dot;

/** The dot mark. */
export class Dot extends RenderableMark {}
