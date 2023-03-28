import type {ChannelValue, ChannelValueIntervalSpec, ChannelValueSpec} from "../channel.js";
import type {Interval} from "../interval.js";
import type {Data, FrameAnchor, MarkOptions, RenderableMark} from "../mark.js";
import type {SymbolType} from "../symbol.js";

/** Options for the dot mark. */
export interface DotOptions extends MarkOptions {
  /**
   * The horizontal position of the dot’s center, typically bound to the *x*
   * scale.
   */
  x?: ChannelValueSpec;

  /**
   * The vertical position of the dot’s center, typically bound to the *y*
   * scale.
   */
  y?: ChannelValueSpec;

  /**
   * The **r** option can be specified as either a channel or constant. When the
   * radius is specified as a number, it is interpreted as a constant, in
   * pixels; otherwise it is interpreted as a channel, typically bound to the
   * *r* channel, which defaults to the *sqrt* type for proportional symbols.
   * The radius defaults to 4.5 pixels when using the **symbol** channel, and
   * otherwise 3 pixels. Dots with a nonpositive radius are not drawn.
   */
  r?: ChannelValueSpec | number;

  /**
   * An angle to rotate the **symbol** around its center. Defaults to 0 degrees,
   * pointing up. Obviously inoperant with the *circle* symbol.
   */
  rotate?: ChannelValue | number;

  /**
   * The categorical symbol; if a channel, bound to the *symbol* scale. A
   * constant symbol can be specified by a name such as *star*, or by its
   * implementation as a function of the *context* and *size*. Defaults to
   * *circle* for the **dot** mark, and *hexagon* for the **hexagon** mark.
   */
  symbol?: ChannelValueSpec | SymbolType;

  /**
   * The frame anchor may be specified as one of the four sides (*top*, *right*,
   * *bottom*, *left*), one of the four corners (*top-left*, *top-right*,
   * *bottom-right*, *bottom-left*), or the *middle* of the frame. It controls
   * any component of the dot’s position not specified by **x** or **y**.
   *
   * For example, for a dot marking each bin and positioned at the top of the
   * frame:
   *
   * ```js
   * Plot.dot(*data*, Plot.binX({x: "date", frameAnchor: "top"}))
   * ```
   */
  frameAnchor?: FrameAnchor;
}

/** Options for the dotX mark. */
export interface DotXOptions extends Omit<DotOptions, "y"> {
  /**
   *
   */
  y?: ChannelValueIntervalSpec;

  /**
   *
   */
  interval?: Interval;
}

/** Options for the dotY mark. */
export interface DotYOptions extends Omit<DotOptions, "x"> {
  /**
   *
   */
  x?: ChannelValueIntervalSpec;

  /**
   *
   */
  interval?: Interval;
}

/**
 * Draws circles, or other symbols, as in a scatterplot.
 *
 * In addition to the standard mark options, the following optional channels are
 * supported:
 *
 * - **x** - the horizontal position; bound to the *x* scale
 * - **y** - the vertical position; bound to the *y* scale
 * - **r** - the radius (area); bound to the *radius* scale, which defaults to
 *   *sqrt*
 * - **rotate** - the rotation angle in degrees clockwise
 * - **symbol** - the categorical symbol; bound to the *symbol* scale
 *
 * For example, a scatterplot of sales by fruit type (category) and units sold
 * (quantitative):
 *
 * ```js
 * Plot.dot(sales, {x: "units", y: "fruit"})
 * ```
 *
 * If either of the **x** or **y** channels are not specified, the corresponding
 * position is controlled by the **frameAnchor** option.
 *
 * The following options are also supported:
 *
 * - **r** - the effective radius
 * - **rotate** - the rotation angle in degrees clockwise; defaults to 0
 * - **symbol** - the categorical symbol; defaults to circle
 * - **frameAnchor** - the frame anchor; defaults to *middle*
 *
 *
 * The **stroke** defaults to none. The **fill** defaults to currentColor if the
 * stroke is none, and to none otherwise. The **strokeWidth** defaults to 1.5.
 * The **rotate** and **symbol** options can be specified as either channels or
 * constants. When rotate is specified as a number, it is interpreted as a
 * constant; otherwise it is interpreted as a channel. When symbol is a valid
 * symbol name or symbol object (implementing the draw method), it is
 * interpreted as a constant; otherwise it is interpreted as a channel. If the
 * **symbol** channel’s values are all symbols, symbol names, or nullish, the
 * channel is unscaled (values are interpreted literally); otherwise, the
 * channel is bound to the *symbol* scale.
 *
 * The built-in **symbol** types are: *circle*, *cross*, *diamond*, *square*,
 * *star*, *triangle*, and *wye* (for fill) and *circle*, *plus*, *times*,
 * *triangle2*, *asterisk*, *square2*, and *diamond2* (for stroke, based on
 * [Heman Robinson’s
 * research](https://www.tandfonline.com/doi/abs/10.1080/10618600.2019.1637746)).
 * The *hexagon* symbol is also supported. You can also specify a D3 or custom
 * symbol type as an object that implements the [*symbol*.draw(*context*,
 * *size*)](https://github.com/d3/d3-shape/blob/main/README.md#custom-symbol-types)
 * method.
 *
 * Dots are sorted by descending radius by default to mitigate overplotting; set
 * the **sort** option to null to draw them in input order.
 *
 * If neither the **x** nor **y** nor **frameAnchor** options are specified,
 * *data* is assumed to be an array of pairs [[*x₀*, *y₀*], [*x₁*, *y₁*], [*x₂*,
 * *y₂*], …] such that **x** = [*x₀*, *x₁*, *x₂*, …] and **y** = [*y₀*, *y₁*,
 * *y₂*, …].
 */
export function dot(data?: Data, options?: DotOptions): Dot;

/**
 * Equivalent to **dot** except that if the **x** option is not specified, it
 * defaults to the identity function and assumes that *data* = [*x₀*, *x₁*,
 * *x₂*, …].
 *
 * ```js
 * Plot.dotX(cars.map(d => d["economy (mpg)"]))
 * ```
 *
 * If an **interval** is specified, such as "day", **y** is transformed to the
 * middle of the day. If the interval is specified as a number *n*, **y** will
 * be the midpoint of two consecutive multiples of *n* that bracket **y**.
 */
export function dotX(data?: Data, options?: DotXOptions): Dot;

/**
 * Equivalent to **dot** except that if the **y** option is not specified, it
 * defaults to the identity function and assumes that *data* = [*y₀*, *y₁*,
 * *y₂*, …].
 *
 * ```js
 * Plot.dotY(cars.map(d => d["economy (mpg)"]))
 * ```
 *
 * If an **interval** is specified, such as "day", **x** is transformed to the
 * middle of the day. If the interval is specified as a number *n*, **x** will
 * be the midpoint of two consecutive multiples of *n* that bracket **x**.
 */
export function dotY(data?: Data, options?: DotYOptions): Dot;

/**
 * Equivalent to **dot** except that the **symbol** option is set to *circle*.
 */
export function circle(data?: Data, options?: Exclude<DotOptions, "symbol">): Dot;

/**
 * Equivalent to **dot**, except that the **symbol** option is set to *hexagon*.
 */
export function hexagon(data?: Data, options?: Exclude<DotOptions, "symbol">): Dot;

/** The dot mark. */
export class Dot extends RenderableMark {}
