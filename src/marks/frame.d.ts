import type {InsetOptions} from "../inset.js";
import type {MarkOptions, RenderableMark} from "../mark.js";

export interface FrameOptions extends MarkOptions, InsetOptions {
  /**
   * If not null, only renders that side of the frame. The *rx*, *ry*, *fill*,
   * and *fillOpacity* options are then ignored.
   */
  anchor?: "top" | "right" | "bottom" | "left" | null;

  /**
   * Rounded corner radius, in pixels.
   */
  rx?: number | string;

  /**
   * Rounded corner radius, in pixels (if different from *rx*, for elliptical
   * corners).
   */
  ry?: number | string;
}

/**
 * Draws a simple frame around the entire plot (or facet).
 *
 * Use **stroke** to change the color, or **fill** to add a background color.
 */
export function frame(options?: FrameOptions): Frame;

/** The frame mark */
export class Frame extends RenderableMark {}
