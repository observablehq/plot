import type {InsetOptions} from "../inset.js";
import type {MarkOptions, RenderableMark} from "../mark.js";
import type {RectCornerOptions} from "./rect.js";

/** Options for the frame decoration mark. */
export interface FrameOptions extends MarkOptions, InsetOptions, RectCornerOptions {
  /**
   * If null (default), the rectangular outline of the frame is drawn; otherwise
   * the frame is drawn as a line only on the given side, and the **rx**,
   * **ry**, **fill**, and **fillOpacity** options are ignored.
   */
  anchor?: "top" | "right" | "bottom" | "left" | null;
}

/**
 * Draws a rectangle around the plot’s frame, or if an **anchor** is given, a
 * line on the given side. Useful for visual separation of facets, or in
 * conjunction with axes and grids to fill the frame’s background.
 */
export function frame(options?: FrameOptions): Frame;

/** The frame decoration mark. */
export class Frame extends RenderableMark {}
