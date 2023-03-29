import type {ChannelValue, ChannelValueSpec} from "../channel.js";
import type {Data, MarkOptions, RenderableMark} from "../mark.js";

/** Options for the density mark. */
export interface DensityOptions extends MarkOptions {
  /** The horizontal point position, typically bound to the *x* scale. */
  x?: ChannelValueSpec;

  /** The vertical point position, typically bound to the *y* scale. */
  y?: ChannelValueSpec;

  /**
   * Group points into series and create independent contours for each series.
   */
  z?: ChannelValue;

  /**
   * The **weight** channel, which defaults to 1, specifies the weight of each
   * point. Non-positive weights are allowed, making associated points
   * repulsive.
   */
  weight?: ChannelValue;

  /**
   * The **bandwidth** option, which defaults to 20, specifies the standard
   * deviation of the Gaussian kernel used for estimation in pixels.
   */
  bandwidth?: number;

  /**
   * The **thresholds** option, which defaults to 20, specifies one more than
   * the number of contours that will be computed at uniformly-spaced intervals
   * between 0 (exclusive) and the maximum density (exclusive). The
   * **thresholds** option may also be specified as an array or iterable of
   * explicit density values.
   */
  thresholds?: number | Iterable<number>;
}

/**
 * Draws contours representing the estimated density of the two-dimensional
 * points given by the **x** and **y** channels, and possibly weighted by the
 * **weight** channel. If either of the **x** or **y** channels are not
 * specified, the corresponding position is controlled by the **frameAnchor**
 * option.
 *
 * The **thresholds** option, which defaults to 20, specifies one more than the
 * number of contours that will be computed at uniformly-spaced intervals
 * between 0 (exclusive) and the maximum density (exclusive). The **thresholds**
 * option may also be specified as an array or iterable of explicit density
 * values. The **bandwidth** option, which defaults to 20, specifies the
 * standard deviation of the Gaussian kernel used for estimation in pixels.
 *
 * If a **z**, **stroke** or **fill** channel is specified, the input points are
 * grouped by series, and separate sets of contours are generated for each
 * series. If the **stroke** or **fill** is specified as *density*, a color
 * channel is constructed with values representing the density threshold value
 * of each contour.
 */
export function density(data?: Data, options?: DensityOptions): Density;

/** The density mark. */
export class Density extends RenderableMark {}
