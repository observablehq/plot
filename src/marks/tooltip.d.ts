import type {ChannelValueSpec} from "../channel.js";
import type {Data, FrameAnchor, MarkOptions, RenderableMark} from "../mark.js";
import type {TextOptions} from "./text.js";

/** Options for styling text. TODO Move to TextOptions? */
type TextStyles = Pick<TextOptions, "lineHeight" | "lineWidth" | "monospace" | "fontFamily" | "fontSize" | "fontStyle" | "fontVariant" | "fontWeight">; // prettier-ignore

/** Options for the tooltip mark. */
export interface TooltipOptions extends MarkOptions, TextStyles {
  /**
   * The horizontal position channel specifying the tooltip’s anchor, typically
   * bound to the *x* scale.
   */
  x?: ChannelValueSpec;

  /**
   * The vertical position channel specifying the tooltip’s anchor, typically
   * bound to the *y* scale.
   */
  y?: ChannelValueSpec;

  /**
   * The frame anchor specifies defaults for **x** and **y** based on the plot’s
   * frame; it may be one of the four sides (*top*, *right*, *bottom*, *left*),
   * one of the four corners (*top-left*, *top-right*, *bottom-right*,
   * *bottom-left*), or the *middle* of the frame. For example, for tooltips
   * distributed horizontally at the top of the frame:
   *
   * ```js
   * Plot.tooltip(data, {x: "date", frameAnchor: "top"})
   * ```
   */
  frameAnchor?: FrameAnchor;

  /** TODO */
  maxRadius?: number;

  /** TODO */
  corner?: "top-left" | "top-right" | "bottom-right" | "bottom-left";
}

/**
 * Returns a new tooltip mark for the given *data* and *options*.
 *
 * If either **x** or **y** is not specified, the default is determined by the
 * **frameAnchor** option. If none of **x**, **y**, and **frameAnchor** are
 * specified, *data* is assumed to be an array of pairs [[*x₀*, *y₀*], [*x₁*,
 * *y₁*], [*x₂*, *y₂*], …] such that **x** = [*x₀*, *x₁*, *x₂*, …] and **y** =
 * [*y₀*, *y₁*, *y₂*, …].
 */
export function tooltip(data?: Data, options?: TooltipOptions): Tooltip;

/** The tooltip mark. */
export class Tooltip extends RenderableMark {}
