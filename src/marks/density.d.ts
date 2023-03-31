import type {ChannelValue, ChannelValueSpec} from "../channel.js";
import type {Data, MarkOptions, RenderableMark} from "../mark.js";

/** Options for the density mark. */
export interface DensityOptions extends MarkOptions {
  /** The horizontal position channel, typically bound to the *x* scale. */
  x?: ChannelValueSpec;
  /** The vertical position channel, typically bound to the *y* scale. */
  y?: ChannelValueSpec;

  /**
   * An optional ordinal channel for grouping, producing independent contours
   * for each group. If not specified, it defaults to **fill** if a channel, or
   * **stroke** if a channel.
   */
  z?: ChannelValue;

  /**
   * An optional weight channel specifying the relative contribution of each
   * point. If not specified, all points have a constant weight of 1.
   * Non-positive weights are allowed, making associated points repulsive.
   */
  weight?: ChannelValue;

  /**
   * The bandwidth, a number in pixels which defaults to 20, specifies the
   * standard deviation of the Gaussian kernel used for density estimation. A
   * larger value will produce smoother contours.
   */
  bandwidth?: number;

  /**
   * How many contours to produce, and at what density; either a number, by
   * default 20, specifying one more than the number of contours that will be
   * computed at uniformly-spaced intervals between 0 (exclusive) and the
   * maximum density (exclusive); or, an iterable of explicit density values.
   */
  thresholds?: number | Iterable<number>;
}

/**
 * Returns a mark that draws contours representing the estimated density of the
 * two-dimensional points given by **x** and **y**, and possibly weighted by
 * **weight**. If either **x** or **y** is not specified, it defaults to the
 * respective middle of the plot’s frame.
 *
 * If the **stroke** or **fill** is specified as *density*, a color channel is
 * constructed with values representing the density threshold value of each
 * contour.
 */
export function density(data?: Data, options?: DensityOptions): Density;

/** The density mark. */
export class Density extends RenderableMark {}
