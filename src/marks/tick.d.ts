import type {ChannelValueSpec} from "../channel.js";
import type {InsetOptions} from "../inset.js";
import type {Data, MarkOptions, RenderableMark} from "../mark.js";

/** Options for the tickX mark. */
export interface TickXOptions extends MarkOptions, Omit<InsetOptions, "insetLeft" | "insetRight"> {
  /**
   * The required horizontal position of the tick; a channel typically bound to
   * the *x* scale.
   */
  x?: ChannelValueSpec;

  /**
   * The optional vertical position of the tick; a categorical channel typically
   * bound to the *y* scale. If not specified, the tick spans the vertical
   * extent of the frame; otherwise the *y* scale must be a *band* scale.
   *
   * If **y** represents quantitative or temporal values, use a ruleX mark
   * instead.
   */
  y?: ChannelValueSpec;
}

/** Options for the tickY mark. */
export interface TickYOptions extends MarkOptions, Omit<InsetOptions, "insetTop" | "insetBottom"> {
  /**
   * The required vertical position of the tick; a channel typically bound to
   * the *y* scale.
   */
  y?: ChannelValueSpec;

  /**
   * The optional horizontal position of the tick; a categorical channel
   * typically bound to the *x* scale. If not specified, the tick spans the
   * horizontal extent of the frame; otherwise the *x* scale must be a *band*
   * scale.
   *
   * If **x** represents quantitative or temporal values, use a ruleY mark
   * instead.
   */
  x?: ChannelValueSpec;
}

/**
 * Returns a new horizontally-positioned tickX mark (a vertical line, |) for the
 * given *data* and *options*. The **x** channel specifies the tick’s horizontal
 * position and defaults to identity, assuming that *data* = [*x₀*, *x₁*, *x₂*,
 * …]; the optional **y** categorical channel specifies its vertical position.
 * For example, for a horizontal barcode plot of penguins’ weights:
 *
 * ```js
 * Plot.tickX(penguins, {x: "body_mass_g", y: "sex", stroke: "species"})
 * ```
 *
 * If **y** represents quantitative or temporal values, use a ruleX mark
 * instead.
 */
export function tickX(data?: Data, options?: TickXOptions): TickX;

/**
 * Returns a new vertically-positioned tickY mark (a horizontal line, —) for the
 * given *data* and *options*. The **y** channel specifies the vertical position
 * of the tick and defaults to identity, assuming that *data* = [*y₀*, *y₁*,
 * *y₂*, …]; the optional **x** categorical channel specifies its horizontal
 * position. For example, fpr a vertical barcode plot of penguins’ weights:
 *
 * ```js
 * Plot.tickY(penguins, {y: "body_mass_g", x: "sex", stroke: "species"})
 * ```
 *
 * If **x** represents quantitative or temporal values, use a ruleY mark
 * instead.
 */
export function tickY(data?: Data, options?: TickYOptions): TickY;

/** The tickX mark. */
export class TickX extends RenderableMark {}

/** The tickY mark. */
export class TickY extends RenderableMark {}
