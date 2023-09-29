import type {ChannelName, ChannelValueSpec} from "../channel.js";
import type {Data, FrameAnchor, MarkOptions, RenderableMark} from "../mark.js";
import type {TextStyles} from "./text.js";

/** Options for the tip mark. */
export interface TipOptions extends MarkOptions, TextStyles {
  /**
   * The horizontal position channel specifying the tip’s anchor, typically
   * bound to the *x* scale.
   */
  x?: ChannelValueSpec;

  /**
   * The starting horizontal position channel specifying the tip’s anchor,
   * typically bound to the *x* scale.
   */
  x1?: ChannelValueSpec;

  /**
   * The ending horizontal position channel specifying the tip’s anchor,
   * typically bound to the *x* scale.
   */
  x2?: ChannelValueSpec;

  /**
   * The vertical position channel specifying the tip’s anchor, typically
   * bound to the *y* scale.
   */
  y?: ChannelValueSpec;

  /**
   * The starting vertical position channel specifying the tip’s anchor,
   * typically bound to the *y* scale.
   */
  y1?: ChannelValueSpec;

  /**
   * The ending vertical position channel specifying the tip’s anchor, typically
   * bound to the *y* scale.
   */
  y2?: ChannelValueSpec;

  /**
   * The frame anchor specifies defaults for **x** and **y** based on the plot’s
   * frame; it may be one of the four sides (*top*, *right*, *bottom*, *left*),
   * one of the four corners (*top-left*, *top-right*, *bottom-right*,
   * *bottom-left*), or the *middle* of the frame. For example, for tips
   * distributed horizontally at the top of the frame:
   *
   * ```js
   * Plot.tip(data, {x: "date", frameAnchor: "top"})
   * ```
   */
  frameAnchor?: FrameAnchor;

  /**
   * The tip anchor specifies how to orient the tip box relative to its anchor
   * position; it refers to the part of the tip box that is attached to the
   * anchor point. For example, the *top-left* anchor places the top-left corner
   * of tip box near the anchor position, hence placing the tip box below and to
   * the right of the anchor position.
   */
  anchor?: FrameAnchor;

  /**
   * How channel values are formatted for display. If a format is a string, it
   * is interpreted as a (UTC) time format for temporal channels, and otherwise
   * a number format.
   */
  format?: {[name in ChannelName]?: boolean | string | ((d: any, i: number) => string)};
}

/**
 * Returns a new tip mark for the given *data* and *options*.
 *
 * If either **x** or **y** is not specified, the default is determined by the
 * **frameAnchor** option. If none of **x**, **y**, and **frameAnchor** are
 * specified, *data* is assumed to be an array of pairs [[*x₀*, *y₀*], [*x₁*,
 * *y₁*], [*x₂*, *y₂*], …] such that **x** = [*x₀*, *x₁*, *x₂*, …] and **y** =
 * [*y₀*, *y₁*, *y₂*, …].
 */
export function tip(data?: Data, options?: TipOptions): Tip;

/** The tip mark. */
export class Tip extends RenderableMark {}
