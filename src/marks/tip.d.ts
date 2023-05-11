import type {ChannelValueSpec} from "../channel.js";
import type {Data, FrameAnchor, MarkOptions, RenderableMark} from "../mark.js";
import type {TextOptions} from "./text.js";

/** Options for styling text. TODO Move to TextOptions? */
type TextStyles = Pick<TextOptions, "lineHeight" | "lineWidth" | "monospace" | "fontFamily" | "fontSize" | "fontStyle" | "fontVariant" | "fontWeight">; // prettier-ignore

/** Options for the tip mark. */
export interface TipOptions extends MarkOptions, TextStyles {
  /**
   * The horizontal position channel specifying the tip’s anchor, typically
   * bound to the *x* scale.
   */
  x?: ChannelValueSpec;

  /**
   * The vertical position channel specifying the tip’s anchor, typically
   * bound to the *y* scale.
   */
  y?: ChannelValueSpec;

  // TODO x1, y1, x2, y2

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

  /** TODO */
  anchor?: FrameAnchor;
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
