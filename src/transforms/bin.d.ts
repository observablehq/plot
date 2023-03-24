import type {ChannelReducers} from "../channel.js";
import type {RangeInterval} from "../interval.js";
import type {Reducer} from "../reducer.js";
import type {Transformed} from "./basic.js";

/** The built-in thresholds implementations. */
export type ThresholdsName = "freedman-diaconis" | "scott" | "sturges" | "auto";

/** How to subdivide a continuous domain into discrete bins (based on data). */
export type ThresholdsFunction<T = number | Date> = (values: T[], min: T, max: T) => T[] | RangeInterval<T> | number;

/** How to subdivide a continuous domain into discrete bins. */
export type Thresholds<T = number | Date> = ThresholdsName | ThresholdsFunction<T> | RangeInterval<T> | T[] | number;

/** Options for the bin transform. */
export interface BinOptions<T = number | Date> {
  /**
   * If true or a positive number, produce a cumulative distribution; if a
   * negative number, produce a [complementary cumulative](https://en.wikipedia.org/wiki/Cumulative_distribution_function#Complementary_cumulative_distribution_function_.28tail_distribution.29)
   * distribution; if false or zero (the default), produce a frequency
   * distribution.
   */
  cumulative?: boolean | number;

  /**
   * The domain of allowed values; if specified, values outside the domain will
   * be ignored; otherwise defaults to the extent [*min*, *max*] of input
   * values. If a function, it is passed the input values and must return the
   * domain. When **thresholds** are specified as an interval and the default
   * domain is used, the start and end of the domain will be extended to align
   * with the interval.
   */
  domain?: ((values: T[]) => [min: T, max: T]) | [min: T, max: T];

  /**
   * How to subdivide the domain into bins. May be one of:
   *
   * * *auto* (default) - Scott’s rule, capped at 200 bins
   * * *freedman-diaconis* - the [Freedman–Diaconis rule](https://en.wikipedia.org/wiki/Freedman–Diaconis_rule)
   * * *scott* - [Scott’s normal reference rule](https://en.wikipedia.org/wiki/Histogram#Scott.27s_normal_reference_rule)
   * * *sturges* - [Sturges’ formula](https://en.wikipedia.org/wiki/Histogram#Sturges.27_formula)
   * * a count representing the desired number of bins (a hint; not guaranteed)
   * * an array of *n* threshold values for *n* - 1 bins
   * * an interval; see **interval**
   * * a function that returns an array, count, or interval
   */
  thresholds?: Thresholds<T>;

  /**
   * How to subdivide the domain into bins; an alternative to **thresholds**.
   * May be either: an interval object that implements *floor*, *offset*, and
   * *range* methods; a named time interval such as *day*; or a number. If a
   * number *n*, threshold values are consecutive multiples of *n* that span the
   * domain.
   */
  interval?: RangeInterval<T>;
}

/** How to reduce binned values. */
export type BinReducer =
  | Reducer
  | BinReducerFunction
  | BinReducerImplementation
  | "x"
  | "x1"
  | "x2"
  | "y"
  | "y1"
  | "y2";

/** A functional bin reducer implementation. */
export type BinReducerFunction = (values: any[], extent: {x1: any; y1: any; x2: any; y2: any}) => any;

/** A bin reducer implementation. */
export interface BinReducerImplementation {
  /**
   * Given an *index* representing the contents of the current bin, the array of
   * input channel *values*, and the current bin’s *extent*, returns the
   * corresponding reduced value to output.
   */
  reduceIndex(index: number[], values: any[], extent: {x1: any; y1: any; x2: any; y2: any}): any;
  // TODO scope
  // TODO label
}

/** Options for outputs of the bin transform. */
export interface BinOutputOptions extends BinOptions {
  /**
   * How to reduce data; defaults to the identity reducer, outputting the array
   * of data for each bin in input order.
   */
  data?: BinReducer | null;

  /**
   * How to filter bins: if the reducer emits a falsey value, the bin will be
   * dropped; by default, empty bins are dropped. Use null to disable filtering
   * and return all bins, for example to impute missing zeroes when summing
   * values for a line chart.
   */
  filter?: BinReducer | null;

  /**
   * How to order bins. By default, bins are returned in ascending natural order
   * along *x*, *y*, and *z* (or *fill* or *stroke*). Bin order affects draw
   * order of overlapping marks, and may be useful in conjunction with the stack
   * transform which defaults to input order. For example to place the smallest
   * bin within each stack on the baseline:
   *
   * ```js
   * Plot.binX({y: "count", sort: "count"}, {fill: "sex", x: "weight"})
   * ```
   */
  sort?: BinReducer | null;

  /** If true, reverse the order of generated bins; defaults to false. */
  reverse?: boolean;
}

/** How to reduce binned channel values. */
export type BinOutputs = ChannelReducers<BinReducer> & BinOutputOptions;

/**
 * Aggregates continuous data—quantitative or temporal values such as
 * temperatures or times—into discrete bins and then computes summary statistics
 * for each bin such as a count or sum. The binX transform is often used in
 * conjunction with the rectY mark, to make histograms.
 *
 * ```
 * Plot.rectY(penguins, Plot.binX({y: "count"}, {x: "culmen_length_mm"}))
 * ```
 *
 * The following aggregation methods are supported:
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
 * * *mode* - the value with the most occurrences
 * * *pXX* - the percentile value, where XX is a number in [00,99]
 * * *deviation* - the standard deviation
 * * *variance* - the variance per [Welford’s algorithm](https://en.wikipedia.org/wiki/Algorithms_for_calculating_variance#Welford's_online_algorithm)
 * * *x* - the middle of the bin’s *x* extent (when binning on *x*)
 * * *x1* - the lower bound of the bin’s *x* extent (when binning on *x*)
 * * *x2* - the upper bound of the bin’s *x* extent (when binning on *x*)
 * * *y* - the middle of the bin’s *y* extent (when binning on *y*)
 * * *y1* - the lower bound of the bin’s *y* extent (when binning on *y*)
 * * *y2* - the upper bound of the bin’s *y* extent (when binning on *y*)
 * * a function to be passed the array of values for each bin and the extent of the bin
 * * an object with a *reduce* method, and optionally a *scope*
 *
 * Most aggregation methods require binding the output channel to an input
 * channel; for example, if you want the **y** output channel to be a *sum* (not
 * merely a count), there should be a corresponding **y** input channel
 * specifying which values to sum. If there is not, *sum* will be equivalent to
 * *count*.
 *
 * To control how *x* is divided into bins, the following options are supported:
 *
 * * **thresholds** - the threshold values; see below
 * * **interval** - an alternative method of specifying thresholds
 * * **domain** - values outside the domain will be omitted
 * * **cumulative** - if positive, each bin will contain all lesser bins
 */
export function binX<T>(outputs?: BinOutputs, options?: T & BinOptions): Transformed<T>;

/**
 * Aggregates continuous data—quantitative or temporal values such as
 * temperatures or times—into discrete bins and then computes summary statistics
 * for each bin such as a count or sum. The binY transform is often used in
 * conjunction with the rectX mark, to make vertical histograms.
 *
 * ```
 * Plot.rectX(penguins, Plot.binY({x: "count"}, {y: "culmen_length_mm"}))
 * ```
 *
 * The following aggregation methods are supported:
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
 * * *mode* - the value with the most occurrences
 * * *pXX* - the percentile value, where XX is a number in [00,99]
 * * *deviation* - the standard deviation
 * * *variance* - the variance per [Welford’s algorithm](https://en.wikipedia.org/wiki/Algorithms_for_calculating_variance#Welford's_online_algorithm)
 * * *x* - the middle of the bin’s *x* extent (when binning on *x*)
 * * *x1* - the lower bound of the bin’s *x* extent (when binning on *x*)
 * * *x2* - the upper bound of the bin’s *x* extent (when binning on *x*)
 * * *y* - the middle of the bin’s *y* extent (when binning on *y*)
 * * *y1* - the lower bound of the bin’s *y* extent (when binning on *y*)
 * * *y2* - the upper bound of the bin’s *y* extent (when binning on *y*)
 * * a function to be passed the array of values for each bin and the extent of the bin
 * * an object with a *reduce* method, and optionally a *scope*
 *
 * Most aggregation methods require binding the output channel to an input
 * channel; for example, if you want the **y** output channel to be a *sum* (not
 * merely a count), there should be a corresponding **y** input channel
 * specifying which values to sum. If there is not, *sum* will be equivalent to
 * *count*.
 *
 * To control how *y* is divided into bins, the following options are supported:
 *
 * * **thresholds** - the threshold values; see below
 * * **interval** - an alternative method of specifying thresholds
 * * **domain** - values outside the domain will be omitted
 * * **cumulative** - if positive, each bin will contain all lesser bins
 */
export function binY<T>(outputs?: BinOutputs, options?: T & BinOptions): Transformed<T>;

/**
 * Aggregates continuous data—quantitative or temporal values such as
 * temperatures or times—into discrete *x* and *y* bins and then computes
 * summary statistics for each bin such as a count or sum. The bin transform is
 * often used in conjunction with the rect mark, to make heatmaps.
 *
 * ```
 * Plot.rect(penguins, Plot.bin({fill: "count"}, {x: "culmen_depth_mm", y: "culmen_length_mm"}))
 * ```
 *
 * The following aggregation methods are supported:
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
 * * *mode* - the value with the most occurrences
 * * *pXX* - the percentile value, where XX is a number in [00,99]
 * * *deviation* - the standard deviation
 * * *variance* - the variance per [Welford’s algorithm](https://en.wikipedia.org/wiki/Algorithms_for_calculating_variance#Welford's_online_algorithm)
 * * *x* - the middle of the bin’s *x* extent (when binning on *x*)
 * * *x1* - the lower bound of the bin’s *x* extent (when binning on *x*)
 * * *x2* - the upper bound of the bin’s *x* extent (when binning on *x*)
 * * *y* - the middle of the bin’s *y* extent (when binning on *y*)
 * * *y1* - the lower bound of the bin’s *y* extent (when binning on *y*)
 * * *y2* - the upper bound of the bin’s *y* extent (when binning on *y*)
 * * a function to be passed the array of values for each bin and the extent of the bin
 * * an object with a *reduce* method, and optionally a *scope*
 *
 * Most aggregation methods require binding the output channel to an input
 * channel; for example, if you want the **fill** output channel to be a *sum*
 * (not merely a count), there should be a corresponding **fill** input channel
 * specifying which values to sum. If there is not, *sum* will be equivalent to
 * *count*.
 *
 * To control how *x* and *y* are divided into bins, the following options are supported:
 *
 * * **thresholds** - the threshold values; see below
 * * **interval** - an alternative method of specifying thresholds
 * * **domain** - values outside the domain will be omitted
 * * **cumulative** - if positive, each bin will contain all lesser bins
 *
 * To pass separate binning options for *x* and *y*, the **x** and **y** input
 * channels can be specified as an object with the options above and a **value**
 * option to specify the input channel values. (🌶 NOT TYPED.)
 */
export function bin<T>(outputs?: BinOutputs, options?: T & BinOptions): Transformed<T>;
