import type {InsetOptions} from "../inset.js";
import type {MarkOptions, RenderableMark} from "../mark.js";

/** Options for the frame decoration mark. */
export interface FrameOptions extends MarkOptions, InsetOptions {
  /**
   * If null (default), the rectangular outline of the frame is drawn; otherwise
   * the frame is drawn as a line only on the given side, and the **rx**,
   * **ry**, **fill**, and **fillOpacity** options are ignored.
   */
  anchor?: "top" | "right" | "bottom" | "left" | null;

  /**
   * The rounded corner [*x*-radius][1], either in pixels or as a percentage of
   * the frame width. If **rx** is not specified, it defaults to **ry** if
   * present, and otherwise draws square corners.
   *
   * [1]: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/rx
   */
  rx?: number | string;

  /**
   * The rounded corner [*y*-radius][1], either in pixels or as a percentage of
   * the frame height. If **ry** is not specified, it defaults to **rx** if
   * present, and otherwise draws square corners.
   *
   * [1]: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/ry
   */
  ry?: number | string;
}

/**
 * Draws a rectangle around the plot’s frame, or if an **anchor** is given, a
 * line on the given side. Useful for visual separation of facets, or in
 * conjunction with axes and grids to fill the frame’s background.
 */
export function frame(options?: FrameOptions): Frame;

/** The frame decoration mark. */
export class Frame extends RenderableMark {}
