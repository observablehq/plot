import type {ChannelValueIntervalSpec, ChannelValueSpec} from "../channel.js";
import type {InsetOptions} from "../inset.js";
import type {Interval} from "../interval.js";
import type {Data, MarkOptions, RenderableMark} from "../mark.js";

/** Options for the ruleX and ruleY marks. */
interface RuleOptions extends MarkOptions {
  /**
   * How to convert a continuous value (**y** for ruleX, or **x** for ruleY)
   * into an interval; one of:
   *
   * - an object that implements *floor*, *offset*, and *range* methods
   * - a named time interval such as *day* (for date intervals)
   * - a number (for number intervals), defining intervals at integer multiples of *n*
   *
   * For example, to bin Apple’s daily stock price by month, plotting a sequence
   * of barcodes showing monthly distributions:
   *
   * ```js
   * Plot.ruleY(aapl, {x: "Date", y: "Close", interval: "month"})
   * ```
   */
  interval?: Interval;
}

/** Options for the ruleX mark. */
export interface RuleXOptions extends RuleOptions, Omit<InsetOptions, "insetLeft" | "insetRight"> {
  /**
   * The horizontal position of the tick; an optional channel bound to the *x*
   * scale. If not specified, the rule will be horizontally centered in the
   * plot’s frame.
   */
  x?: ChannelValueSpec;

  /**
   * Shorthand for specifying both the primary and secondary vertical position
   * of the tick as the bounds of the containing interval; can only be used in
   * conjunction with the **interval** option.
   */
  y?: ChannelValueIntervalSpec;

  /**
   * The primary (starting) vertical position of the tick; a channel bound to
   * the *y* scale.
   *
   * If *y* represents ordinal values, use a tickX mark instead.
   */
  y1?: ChannelValueSpec;

  /**
   * The secondary (ending) vertical position of the tick; a channel bound to
   * the *y* scale.
   *
   * If *y* represents ordinal values, use a tickX mark instead.
   */
  y2?: ChannelValueSpec;
}

/** Options for the ruleY mark. */
export interface RuleYOptions extends RuleOptions, Omit<InsetOptions, "insetTop" | "insetBottom"> {
  /**
   * Shorthand for specifying both the primary and secondary horizontal position
   * of the tick as the bounds of the containing interval; can only be used in
   * conjunction with the **interval** option.
   */
  x?: ChannelValueIntervalSpec;

  /**
   * The primary (starting) horizontal position of the tick; a channel bound to
   * the *x* scale.
   *
   * If *x* represents ordinal values, use a tickY mark instead.
   */
  x1?: ChannelValueSpec;

  /**
   * The secondary (ending) horizontal position of the tick; a channel bound to
   * the *x* scale.
   *
   * If *x* represents ordinal values, use a tickY mark instead.
   */
  x2?: ChannelValueSpec;

  /**
   * The vertical position of the tick; an optional channel bound to the *y*
   * scale. If not specified, the rule will be vertically centered in the plot’s
   * frame.
   */
  y?: ChannelValueSpec;
}

/**
 * Returns a new horizontally-positioned ruleX mark (a vertical line, |) for the
 * given *data* and *options*. The **x** channel specifies the rule’s horizontal
 * position and defaults to identity, assuming that *data* = [*x₀*, *x₁*, *x₂*,
 * …]; the optional **y1** and **y2** channels specify its vertical extent. For
 * example, for a candlestick chart of Apple’s daily stock price:
 *
 * ```js
 * Plot.ruleX(aapl, {x: "Date", y1: "Open", y2: "Close"})
 * ```
 *
 * If *y* represents ordinal values, use a tickX mark instead.
 */
export function ruleX(data?: Data, options?: RuleXOptions): RuleX;

/**
 * Returns a new vertically-positioned ruleY mark (a horizontal line, —) for the
 * given *data* and *options*. The **y** channel specifies the vertical position
 * of the rule and defaults to identity, assuming that *data* = [*y₀*, *y₁*,
 * *y₂*, …]; the optional **x1** and **x2** channels specify its horizontal
 * extent. For example, to bin Apple’s daily stock price by month, plotting a
 * sequence of barcodes showing monthly distributions:
 *
 * ```js
 * Plot.ruleY(aapl, {x: "Date", y: "Close", interval: "month"})
 * ```
 *
 * If *x* represents ordinal values, use a tickY mark instead.
 */
export function ruleY(data?: Data, options?: RuleYOptions): RuleY;

/** The ruleX mark. */
export class RuleX extends RenderableMark {}

/** The ruleY mark. */
export class RuleY extends RenderableMark {}
