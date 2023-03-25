import type {ChannelValueSpec} from "../channel.js";
import type {CurveAutoOptions} from "../curve.js";
import type {Data, MarkOptions, RenderableMark} from "../mark.js";
import type {MarkerOptions} from "../marker.js";

/** Options for the link mark. */
export interface LinkOptions extends MarkOptions, MarkerOptions, CurveAutoOptions {
  /** The horizontal position, for vertical links; bound to the *x* scale. */
  x?: ChannelValueSpec;
  /** The vertical position, for horizontal links; bound to the *y* scale. */
  y?: ChannelValueSpec;
  /** The starting horizontal position; bound to the *x* scale. */
  x1?: ChannelValueSpec;
  /** The ending vertical position; bound to the *y* scale. */
  y1?: ChannelValueSpec;
  /** The starting horizontal position; bound to the *x* scale. */
  x2?: ChannelValueSpec;
  /** The ending vertical position; bound to the *y* scale. */
  y2?: ChannelValueSpec;
  /**
   * The **curve** option controls interpolation between points. Since a link
   * always has two points by definition, only the following curves (or a custom
   * curve) are recommended: *linear*, *step*, *step-after*, *step-before*,
   * *bump-x*, or *bump-y*. Note that the *linear* curve is incapable of showing
   * a fill since a straight line has zero area. For a curved link, you can use
   * a bent [arrow](#arrow) (with no arrowhead, if desired).
   */
  curve?: CurveAutoOptions["curve"];
}

/**
 * The link mark draws line segments (or curves) connecting pairs of points. For
 * example, to draw a link connecting the situation in 1980 with the situation
 * in 2015 on a scatterplot representing the population and inequality of
 * revenues in U.S. cities:
 *
 * ```js
 * Plot.link(inequality, {x1: "POP_1980", y1: "R90_10_1980", x2: "POP_2015", y2: "R90_10_2015"})
 * ```
 *
 * The following channels are required:
 *
 * - **x1** - the starting horizontal position; bound to the *x* scale
 * - **y1** - the starting vertical position; bound to the *y* scale
 * - **x2** - the ending horizontal position; bound to the *x* scale
 * - **y2** - the ending vertical position; bound to the *y* scale
 *
 * For vertical or horizontal links, the **x** option can be specified as
 * shorthand for **x1** and **x2**, and the **y** option can be specified as
 * shorthand for **y1** and **y2**, respectively.
 *
 * The link mark supports **curve** options to control interpolation between
 * points, and **marker** options to add a marker (such as a dot or an
 * arrowhead) on each of the control points.
 */
export function link(data?: Data, options?: LinkOptions): Link;

/** The link mark. */
export class Link extends RenderableMark {}
