import type {ChannelReducers} from "../channel.js";
import type {Transformed} from "./basic.js";

export interface HexbinOptions {
  binWidth?: number;
}

/**
 * The hexbin transform can be applied to any mark that consumes *x* and *y*,
 * such as the **dot**, **image**, **text**, and **vector** marks. It aggregates
 * values into hexagonal bins of the given **binWidth** (in pixels) and computes
 * new position channels *x* and *y* as the centers of each bin. It can also
 * create new channels by applying a specified reducer to each bin, such as the
 * *count* of elements in the bin.
 *
 * If any of **z**, **fill**, or **stroke** is a channel, the first of these
 * channels will be used to subdivide bins. The *outputs* options are similar to
 * the **bin** transform; each output channel receives as input, for each
 * hexagon, the subset of the data which has been matched to its center. The
 * outputs object specifies the aggregation method for each output channel.
 *
 * The following aggregation methods are supported:
 *
 * * *first* - the first value, in input order
 * * *last* - the last value, in input order
 * * *count* - the number of elements (frequency)
 * * *distinct* - the number of distinct values
 * * *sum* - the sum of values
 * * *proportion* - the sum proportional to the overall total (weighted
 *   frequency)
 * * *proportion-facet* - the sum proportional to the facet total
 * * *min* - the minimum value
 * * *min-index* - the zero-based index of the minimum value
 * * *max* - the maximum value
 * * *max-index* - the zero-based index of the maximum value
 * * *mean* - the mean value (average)
 * * *median* - the median value
 * * *deviation* - the standard deviation
 * * *variance* - the variance per [Welford’s
 *   algorithm](https://en.wikipedia.org/wiki/Algorithms_for_calculating_variance#Welford's_online_algorithm)
 * * *mode* - the value with the most occurrences
 * * a function to be passed the array of values for each bin and the extent of
 *   the bin
 * * an object with a *reduce* method
 *
 * This transform defaults the *symbol* option of the **dot** mark to *hexagon*.
 * See also the **hexgrid** mark.
 */
export function hexbin<T>(outputs?: ChannelReducers, options?: T & HexbinOptions): Transformed<T>;
