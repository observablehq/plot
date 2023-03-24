type Digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

// For internal use.
export type ReducerPercentile =
  | (`p${Digit}${Digit}` & Record<never, never>) // see https://github.com/microsoft/TypeScript/issues/29729
  | "p25"
  | "p50"
  | "p75";

/**
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
 * * a function to be passed the array of values for each bin and the extent of the bin
 * * an object with a *reduce* method, and optionally a *scope*
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
 *  *
 * The following aggregation methods are supported:
 *
 * * *first* - the first value, in input order
 * * *last* - the last value, in input order
 * * *count* - the number of elements (frequency)
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
 * * *mode* - the value with the most occurrences
 * * *pXX* - the percentile value, where XX is a number in [00,99]
 * * *deviation* - the standard deviation
 * * *variance* - the variance per [Welford’s
 *   algorithm](https://en.wikipedia.org/wiki/Algorithms_for_calculating_variance#Welford's_online_algorithm)
 * * a function - passed the array of values for each group
 * * an object with a *reduce* method, an optionally a *scope*
 *
 *
 * The following aggregation methods are supported:
 *
 * * *first* - the first value, in input order
 * * *last* - the last value, in input order
 * * *count* - the number of elements (frequency)
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
 * * *mode* - the value with the most occurrences
 * * *pXX* - the percentile value, where XX is a number in [00,99]
 * * *deviation* - the standard deviation
 * * *variance* - the variance per [Welford’s
 *   algorithm](https://en.wikipedia.org/wiki/Algorithms_for_calculating_variance#Welford's_online_algorithm)
 * * a function - passed the array of values for each group
 * * an object with a *reduce* method, an optionally a *scope*
 *
 *
 * The following aggregation methods are supported:
 *
 * * *first* - the first value, in input order
 * * *last* - the last value, in input order
 * * *count* - the number of elements (frequency)
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
 * * *mode* - the value with the most occurrences
 * * *pXX* - the percentile value, where XX is a number in [00,99]
 * * *deviation* - the standard deviation
 * * *variance* - the variance per [Welford’s
 *   algorithm](https://en.wikipedia.org/wiki/Algorithms_for_calculating_variance#Welford's_online_algorithm)
 * * a function - passed the array of values for each group
 * * an object with a *reduce* method, an optionally a *scope*
 *
 *
 * The following aggregation methods are supported:
 *
 * - *first* - the first value, in input order
 * - *last* - the last value, in input order
 * - *count* - the number of elements (frequency)
 * - *distinct* - the number of distinct values
 * - *sum* - the sum of values
 * - *proportion* - the sum proportional to the overall total (weighted frequency)
 * - *proportion-facet* - the sum proportional to the facet total
 * - *min* - the minimum value
 * - *min-index* - the zero-based index of the minimum value
 * - *max* - the maximum value
 * - *max-index* - the zero-based index of the maximum value
 * - *mean* - the mean value (average)
 * - *median* - the median value
 * - *mode* - the value with the most occurrences
 * - *pXX* - the percentile value, where XX is a number in [00,99]
 * - *deviation* - the standard deviation
 * - *variance* - the variance per [Welford’s algorithm](https://en.wikipedia.org/wiki/Algorithms_for_calculating_variance#Welford's_online_algorithm)
 *
 */
export type ReducerName =
  | "first"
  | "last"
  | "count"
  | "distinct"
  | "sum"
  | "proportion"
  | "proportion-facet"
  | "deviation"
  | "min"
  | "min-index"
  | "max"
  | "max-index"
  | "mean"
  | "median"
  | "variance"
  | "mode"
  | ReducerPercentile;

/**
 * A shorthand functional reducer implementation (from source S to target T):
 * given an array of input channel *values*, returns the corresponding reduced
 * output value.
 */
export type ReducerFunction<S = any, T = S> = (values: S[]) => T;

/** A reducer implementation (from source S to target T). */
export interface ReducerImplementation<S = any, T = S> {
  /**
   * Given an *index* representing the contents of the current group, the array
   * of input channel *values*, returns the corresponding reduced output value.
   * TODO If no input channel is provided (e.g., *count*) then *values* may be
   * undefined.
   */
  reduceIndex(index: number[], values: S[]): T;
  // TODO scope
  // TODO label
}

/**
 * How to reduce aggregated (binned or grouped) values; one of:
 *
 * - a named reducer implementation such as *count* or *sum*
 * - a function that takes an array of values and returns the reduced value
 * - an object that implements the *reduceIndex* method
 *
 * TODO Some reducers require an input channel (e.g., *mean*) while others do
 * not (e.g., *count*).
 *
 * TODO When reducing the *x1*, we may read from the *x* channel if *x1* does
 * not exist, and likewise for *x2*. When reducing the *y1*, we may read from
 * the *y* channel if *y1* does not exist, and likewise for *y2*.
 */
export type Reducer = ReducerName | ReducerFunction | ReducerImplementation;
