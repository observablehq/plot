import type {ChannelValueSpec} from "../channel.js";
import type {InsetOptions} from "../inset.js";
import type {Data, MarkOptions, RenderableMark} from "../mark.js";

/** Options for the tickX mark. */
export interface TickXOptions extends MarkOptions, Omit<InsetOptions, "insetLeft" | "insetRight"> {
  /** The horizontal position of the tick; a channel bound to the *x* scale. */
  x?: ChannelValueSpec;
  /**
   * The vertical position of the tick; an optional categorical channel bound to
   * the *y* scale.
   */
  y?: ChannelValueSpec;
}

/** Options for the tickY mark. */
export interface TickYOptions extends MarkOptions, Omit<InsetOptions, "insetTop" | "insetBottom"> {
  /** The vertical position of the tick; a channel bound to the *y* scale. */
  y?: ChannelValueSpec;
  /**
   * The horizontal position of the tick; an optional categorical channel bound
   * to the *x* scale.
   */
  x?: ChannelValueSpec;
}

/**
 * Returns a new tickX mark for the given *data* and *options*. The **x**
 * channel specifies the horizontal position of the tick, and the optional **y**
 * categorical channel specifies its vertical position. For example, to create
 * a horizontal barcode plot of penguins’ weights:
 *
 * ```js
 * Plot.tickX(penguins, { x: "body_mass_g", y: "sex", stroke: "species" })
 * ```
 *
 * **x** defaults to identity, assuming that *data* contains numbers. If the
 * secondary dimension **y** is quantitative instead of ordinal, use **ruleX**.
 */
export function tickX(data?: Data, options?: TickXOptions): TickX;

/**
 * Returns a new tickY mark for the given *data* and *options*. The **y**
 * channel specifies the vertical position of the tick, and the optional **x**
 * categorical channel specifies its horizontal position. For example, to create
 * a vertical barcode plot of penguins’ weights:
 *
 * ```js
 * Plot.tickY(penguins, { y: "body_mass_g", x: "sex", stroke: "species" })
 * ```
 *
 * **y** defaults to identity, assuming that *data* contains numbers. If the
 * secondary dimension **x** is quantitative instead of ordinal, use **ruleY**.
 */
export function tickY(data?: Data, options?: TickYOptions): TickY;

/** The tickX mark. */
export class TickX extends RenderableMark {}

/** The tickY mark. */
export class TickY extends RenderableMark {}
