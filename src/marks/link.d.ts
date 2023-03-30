import type {ChannelValueSpec} from "../channel.js";
import type {CurveAutoOptions} from "../curve.js";
import type {Data, MarkOptions, RenderableMark} from "../mark.js";
import type {MarkerOptions} from "../marker.js";

/** Options for the link mark. */
export interface LinkOptions extends MarkOptions, MarkerOptions, CurveAutoOptions {
  /**
   * The horizontal position, for vertical links; typically bound to the *x*
   * scale; shorthand for setting defaults for both **x1** and **x2**.
   */
  x?: ChannelValueSpec;

  /**
   * The vertical position, for horizontal links; typically bound to the *y*
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
   * The curve (interpolation) method for connecting adjacent points.
   *
   * Since a link has exactly two points, only the following curves (or a custom
   * curve) are recommended: *linear*, *step*, *step-after*, *step-before*,
   * *bump-x*, or *bump-y*. Note that the *linear* curve is incapable of showing
   * a fill since a straight line has zero area. For a curved link, use an arrow
   * mark with the **bend** option.
   *
   * If the plot uses a spherical **projection**, the default *auto* **curve**
   * will render links as geodesics; to draw a straight line instead, use the
   * *linear* **curve** instead.
   */
  curve?: CurveAutoOptions["curve"];
}

/**
 * Returns a new link mark for the given *data* and *options*, drawing line
 * segments (curves) connecting pairs of points. For example, to draw a link
 * connecting an observation from 1980 with an observation from 2015 in a
 * scatterplot of population and revenue inequality of U.S. cities:
 *
 * ```js
 * Plot.link(inequality, {x1: "POP_1980", y1: "R90_10_1980", x2: "POP_2015", y2: "R90_10_2015"})
 * ```
 *
 * If the plot uses a spherical **projection**, the default *auto* **curve**
 * will render links as geodesics; to draw a straight line instead, use the
 * *linear* **curve** instead.
 */
export function link(data?: Data, options?: LinkOptions): Link;

/** The link mark. */
export class Link extends RenderableMark {}
