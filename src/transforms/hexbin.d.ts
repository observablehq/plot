import type {ChannelReducers, ChannelValue} from "../channel.js";
import type {Initialized} from "./basic.js";

/** Options for the hexbin transform. */
export interface HexbinOptions {
  /**
   * The horizontal distance between centers of neighboring (pointy-topped)
   * hexagons, in pixels; defaults to 20.
   */
  binWidth?: number;

  /**
   * How to subdivide bins. If not specified, defaults to the *fill* channel, if
   * any, or the *stroke* channel, if any. If null, bins will not be subdivided.
   */
  z?: ChannelValue;
}

/**
 * Groups points specified by the *x* and *y* channels into hexagonal bins in
 * scaled coordinates (pixels), computing new *x* and *y* channels as the
 * centers of each bin, and deriving new output channels by applying the
 * specified reducers (such as *count*) to each bin’s values. The first of the
 * *z*, *fill*, or *stroke* channels, if any, will be used to subdivide bins.
 *
 * The hexbin transform can be applied to any mark that consumes *x* and *y*,
 * such as the dot, image, text, and vector marks. For the dot mark, the
 * **symbol** option defaults to *hexagon*, and the *r* option defaults to half
 * the **binWidth**. If a **fill** output channel is declared, the **stroke**
 * option defaults to *none*.
 *
 * The reducer for each channel in *outputs* may be specified as:
 *
 * * *first* - the first value, in input order
 * * *last* - the last value, in input order
 * * *count* - the number of elements (frequency)
 * * *distinct* - the number of distinct values
 * * *sum* - the sum of values
 * * *proportion* - the sum proportional to the overall total (weighted frequency)
 * * *proportion-facet* - the sum proportional to the facet total
 * * *min* - the minimum value
 * * *min-index* - the zero-based index of the minimum value
 * * *max* - the maximum value
 * * *max-index* - the zero-based index of the maximum value
 * * *mean* - the mean value (average)
 * * *median* - the median value
 * * *deviation* - the standard deviation
 * * *variance* - the variance per [Welford’s algorithm](https://en.wikipedia.org/wiki/Algorithms_for_calculating_variance#Welford's_online_algorithm)
 * * *mode* - the value with the most occurrences
 * * a function to be passed the array of values for each bin
 * * an object with a *reduceIndex* method
 *
 * See also the hexgrid mark.
 */
export function hexbin<T>(outputs?: ChannelReducers, options?: T & HexbinOptions): Initialized<T>;
