import type {ChannelValue} from "../channel.js";
import type {RangeInterval} from "../interval.js";
import type {Data, RenderableMark} from "../mark.js";
import type {Thresholds} from "../transforms/bin.js";
import type {RasterOptions, RasterSampler} from "./raster.js";

/** Options for the contour mark. */
export interface ContourOptions extends Omit<RasterOptions, "interval" | "imageRendering"> {
  /**
   * Whether to apply linear interpolation after marching squares when computing
   * contour polygons; defaults to true. For smoother contours, see the **blur**
   * option.
   */
  smooth?: boolean;

  /**
   * The value can be specified as a channel based on the sample *data*, or as a
   * function *f*(*x*, *y*) to be evaluated at each pixel if the *data* is not
   * provided.
   */
  value?: ChannelValue | RasterSampler;

  /**
   * How to subdivide the domain into discrete level sets; defaults to *auto*;
   * one of:
   *
   * - a named threshold implementation such as *auto* (default) or *sturges*
   * - a function that returns an array, count, or range interval
   * - a range interval
   * - an array of *n* threshold values for *n* - 1 bins
   * - a count representing the desired number of bins (a hint; not guaranteed)
   *
   * For example, for about ten contours:
   *
   * ```js
   * Plot.contour({fill: (x, y) => Math.sin(x) * Math.cos(y), thresholds: 10, x1: 0, x2: 1, y1: 0, y2: 1})
   * ```
   *
   * See also the **interval** option.
   */
  thresholds?: Thresholds;

  /**
   * How to subdivide the domain into discrete level sets; a stricter
   * alternative to the **thresholds** option allowing the use of shorthand
   * numeric intervals; one of:
   *
   * - an object that implements *floor*, *offset*, and *range* methods
   * - a named time interval such as *day* (for date intervals)
   * - a number (for number intervals), defining intervals at integer multiples of *n*
   *
   * For example to create an isoline every 10 meters on a topographic map:
   *
   * ```js
   * Plot.contour(volcano.values, {interval: 10, width: volcano.width, height: volcano.height})
   * ```
   */
  interval?: RangeInterval;
}

/**
 * Returns a new contour mark, which creates contour polygons from spatial
 * samples. If *data* is provided, it represents discrete samples in abstract
 * coordinates **x** and **y**; the **value** channel specifies further abstract
 * values (_e.g._, height in a topographic map) to be spatially interpolated to
 * produce a raster grid of quantitative values (like in the raster mark), and
 * lastly contours via marching squares, which are rendered as vector polygons.
 * For example, to generate filled contours from a topographic map, where the
 * color corresponds to the contour threshold value:
 *
 * ```js
 * Plot.contour(volcano.values, {width: volcano.width, height: volcano.height, fill: Plot.identity})
 * ```
 *
 * The **fill** and **fillOpacity** channels may alternatively be specified as
 * functions *f*(*x*, *y*) to be evaluated at each pixel centroid of the
 * underlying raster grid (without interpolation). For example, to draw a
 * contour plot of a two-dimensional function:
 *
 * ```js
 * Plot.contour({x1: -1, x2: 1, y1: -1, y2: 1, fill: (x, y) => Math.atan2(y, x)})
 * ```
 *
 * With the exception of the **x**, **y**, and **value** channels, the contour
 * mark’s channels are not evaluated on the initial *data* but rather on the
 * generated contour multipolygons.
 */
export function contour(data?: Data, options?: ContourOptions): Contour;
export function contour(options?: ContourOptions): Contour;

/** The contour mark. */
export class Contour extends RenderableMark {}
