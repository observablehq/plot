import type {ChannelValueIntervalSpec, ChannelValueSpec} from "../channel.js";
import type {InsetOptions} from "../inset.js";
import type {Interval} from "../interval.js";
import type {Data, MarkOptions, RenderableMark} from "../mark.js";

/** Options for the ruleX and ruleY marks. */
interface RuleOptions extends MarkOptions {
  interval?: Interval;
}

/** Options for the ruleX mark. */
export interface RuleXOptions extends RuleOptions, Omit<InsetOptions, "insetLeft" | "insetRight"> {
  /** The horizontal position of the tick; a channel bound to the *x* scale. */
  x?: ChannelValueSpec;

  /**
   * The vertical position of the tick, specified as a value and an interval;
   * bound to the *y* scale.
   */
  y?: ChannelValueIntervalSpec;

  /**
   * The vertical starting position of the tick; a channel bound to the *y*
   * scale.
   */
  y1?: ChannelValueSpec;

  /**
   * The vertical ending position of the tick; a channel bound to the *y* scale.
   */
  y2?: ChannelValueSpec;
}

/** Options for the ruleY mark. */
export interface RuleYOptions extends RuleOptions, Omit<InsetOptions, "insetTop" | "insetBottom"> {
  /**
   * The horizontal position of the tick, specified as a value and an interval;
   * bound to the *x* scale.
   */
  x?: ChannelValueIntervalSpec;

  /**
   * The horizontal starting position of the tick; a channel bound to the *x*
   * scale.
   */
  x1?: ChannelValueSpec;

  /**
   * The horizontal ending position of the tick; a channel bound to the *x*
   * scale.
   */
  x2?: ChannelValueSpec;

  /** The vertical position of the tick; a channel bound to the *y* scale. */
  y?: ChannelValueSpec;
}

/**
 * An vertical rule. The **x** channel specifies the horizontal position of the
 * rule, and the **y1** and **y2** optional channels specify its vertical
 * extent.
 *
 * For example, to create a candlestick chart of the AAPL ticker:
 *
 * ```js
 * Plot.ruleX(aapl, { x: "Date", y1: "Open", y2: "Close" })
 * ```
 *
 * **x** defaults to identity, assuming that *data* contains numbers. The
 * vertical dimension can be specified as **y** with a value and an interval; if
 * it is ordinal instead of quantitative or temporal, use **tickX**.
 */
export function ruleX(data?: Data, options?: RuleXOptions): RuleX;

/**
 * An horizontal rule. The **y** channel specifies the vertical position of the
 * rule, and the **x1** and **x2** optional channels specify its horizontal
 * extent.
 *
 * For example, this shows the high value of the AAPL ticker as a small rule:
 *
 * ```js
 * Plot.ruleY(aapl, { y: "High", x: {value: "Date", interval: "day"} })
 * ```
 *
 * **y** defaults to identity, assuming that *data* contains numbers. The
 * horizontal dimension can be specified as **x** with a value and an interval;
 * if it is ordinal instead of quantitative or temporal, use **tickY**.
 */
export function ruleY(data?: Data, options?: RuleYOptions): RuleY;

/** The ruleX mark. */
export class RuleX extends RenderableMark {}

/** The ruleY mark. */
export class RuleY extends RenderableMark {}
