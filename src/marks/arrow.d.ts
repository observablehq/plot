import type {ChannelValueSpec} from "../channel.js";
import type {Data, MarkOptions, RenderableMark} from "../mark.js";

/** Options for the arrow mark. */
export interface ArrowOptions extends MarkOptions {
  /**
   * The horizontal position, for vertical arrows; typically bound to the *x*
   * scale; shorthand for setting defaults for both **x1** and **x2**.
   */
  x?: ChannelValueSpec;

  /**
   * The vertical position, for horizontal arrows; typically bound to the *y*
   * scale; shorthand for setting defaults for both **y1** and **y2**.
   */
  y?: ChannelValueSpec;

  /**
   * The starting horizontal position; typically bound to the *x* scale; also
   * sets a default for **x2**.
   */
  x1?: ChannelValueSpec;

  /**
   * The starting vertical position; typically bound to the *y* scale; also sets
   * a default for **y2**.
   */
  y1?: ChannelValueSpec;

  /**
   * The ending horizontal position; typically bound to the *x* scale; also sets
   * a default for **x1**.
   */
  x2?: ChannelValueSpec;

  /**
   * The ending vertical position; typically bound to the *y* scale; also sets a
   * default for **y1**.
   */
  y2?: ChannelValueSpec;

  /**
   * The angle, a constant in degrees, between the straight line intersecting
   * the arrow’s two control points and the outgoing tangent direction of the
   * arrow from the start point. The angle must be within ±90°; a positive angle
   * will produce a clockwise curve, while a negative angle will produce a
   * counterclockwise curve; zero (the default) will produce a straight line.
   * Use true for 22.5°.
   */
  bend?: number | boolean;

  /**
   * How pointy the arrowhead is, in degrees; a constant typically between 0°
   * and 180°, and defaults to 60°.
   */
  headAngle?: number;

  /**
   * The size of the arrowhead relative to the **strokeWidth**; a constant.
   * Assuming the default of stroke width 1.5px, this is the length of the
   * arrowhead’s side in pixels.
   */
  headLength?: number;

  /**
   * Shorthand to set the same default for **insetStart** and **insetEnd**.
   */
  inset?: number;

  /**
   * The starting inset, a constant in pixels; defaults to 0. A positive inset
   * shortens the arrow by moving the starting point towards the endpoint point,
   * while a negative inset extends it by moving the starting point in the
   * opposite direction. A positive starting inset may be useful if the arrow
   * emerges from a dot.
   */
  insetStart?: number;

  /**
   * The ending inset, a constant in pixels; defaults to 0. A positive inset
   * shortens the arrow by moving the ending point towards the starting point,
   * while a negative inset extends it by moving the ending point in the
   * opposite direction. A positive ending inset may be useful if the arrow
   * points to a dot.
   */
  insetEnd?: number;
}

/**
 * Returns a new arrow mark for the given *data* and *options*, drawing
 * (possibly swoopy) arrows connecting pairs of points. For example, to draw an
 * arrow connecting an observation from 1980 with an observation from 2015 in a
 * scatterplot of population and revenue inequality of U.S. cities:
 *
 * ```js
 * Plot.arrow(inequality, {x1: "POP_1980", y1: "R90_10_1980", x2: "POP_2015", y2: "R90_10_2015", bend: true})
 * ```
 */
export function arrow(data?: Data, options?: ArrowOptions): Arrow;

/** The arrow mark. */
export class Arrow extends RenderableMark {}
