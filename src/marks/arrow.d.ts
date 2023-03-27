import type {ChannelValueSpec} from "../channel.js";
import type {Data, MarkOptions, RenderableMark} from "../mark.js";

/** Options for the arrow mark. */
export interface ArrowOptions extends MarkOptions {
  /**
   * The horizontal position, shorthand for both **x1** and **x2** for vertical
   * arrows; bound to the *x* scale.
   */
  x?: ChannelValueSpec;

  /**
   * The vertical position, shorthand for both **y1** and **y2** for horizontal
   * arrows; bound to the *y* scale.
   */
  y?: ChannelValueSpec;

  /**
   * The horizontal position of the start point; bound to the *x* scale.
   */
  x1?: ChannelValueSpec;

  /**
   * The vertical position of the start point; bound to the *y* scale.
   */
  y1?: ChannelValueSpec;

  /**
   * The horizontal position of the end point; bound to the *x* scale.
   */
  x2?: ChannelValueSpec;

  /**
   * The vertical position of the end point; bound to the *y* scale.
   */
  y2?: ChannelValueSpec;

  /**
   * The bend angle, in degrees, sets the angle between the straight line
   * between the two points and the outgoing direction of the arrow from the
   * start point. It must be within ±90°. A positive angle will produce a
   * clockwise curve; a negative angle will produce a counterclockwise curve;
   * zero (the default) will produce a straight line. Use true for 22.5°.
   */
  bend?: number | boolean;

  /**
   * The **headAngle**, in degrees, determines how pointy the arrowhead is; it
   * is typically between 0° and 180°. Defaults to 60.
   */
  headAngle?: number;

  /**
   * The **headLength** determines the scale of the arrowhead relative to the
   * stroke width. Assuming the default of stroke width 1.5px, the
   * **headLength** is the length of the arrowhead’s side in pixels.
   */
  headLength?: number;

  /**
   * Shorthand for insetStart and insetEnd, in pixels.
   */
  inset?: number;

  /**
   * Inset at the start of the arrow, in pixels (useful if the arrow emerges
   * from a dot). Defaults to 0.
   */
  insetStart?: number;

  /**
   * Inset at the end of the arrow, in pixels (useful if the arrow points to a
   * dot). Defaults to 0.
   */
  insetEnd?: number;
}

/**
 * Draws (possibly swoopy) arrows connecting pairs of points. For example, to
 * display arrows connecting two points in a scatterplot that represent the
 * population vs income inequality in 1980 and 2015 for U.S. cities:
 *
 * ```js
 * Plot.arrow(inequality, {x1: "POP_1980", y1: "R90_10_1980", x2: "POP_2015", y2: "R90_10_2015", bend: true})
 * ```
 *
 * The following channels are required:
 *
 * - **x1** - the starting horizontal position; bound to the *x* scale
 * - **y1** - the starting vertical position; bound to the *y* scale
 * - **x2** - the ending horizontal position; bound to the *x* scale
 * - **y2** - the ending vertical position; bound to the *y* scale
 *
 * For vertical or horizontal arrows, the **x** option can be specified as
 * shorthand for **x1** and **x2**, and the **y** option can be specified as
 * shorthand for **y1** and **y2**, respectively.
 *
 * The **stroke** defaults to currentColor. The **fill** defaults to none. The
 * **strokeWidth** defaults to 1.5, and the **strokeMiterlimit** defaults to
 * one. The following additional options are supported:
 *
 * - **bend** - the bend angle, in degrees; defaults to zero (true for 22.5°)
 * - **headAngle** - the arrowhead angle, in degrees; defaults to 60°
 * - **headLength** - the arrowhead length, in pixels; defaults to 8. Disable
 *   the arrow with headLength = 0
 * - **insetEnd** - inset at the end of the arrow (useful if the arrow points to
 *   a dot)
 * - **insetStart** - inset at the start of the arrow
 * - **inset** - shorthand for the two insets
 */
export function arrow(data?: Data, options?: ArrowOptions): Arrow;

/** The arrow mark. */
export class Arrow extends RenderableMark {}
