type Digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

// For internal use.
export type ReducerPercentile =
  | (`p${Digit}${Digit}` & Record<never, never>) // see https://github.com/microsoft/TypeScript/issues/29729
  | "p25"
  | "p50"
  | "p75";

/**
 * The built-in reducer implementations; one of:
 *
 * - *first* - the first value, in input order
 * - *last* - the last value, in input order
 * - *count* - the number of elements (frequency)
 * - *distinct* - the number of distinct values
 * - *sum* - the sum of values
 * - *proportion* - the sum proportional to the overall total (weighted frequency)
 * - *proportion-facet* - the sum proportional to the facet total
 * - *deviation* - the standard deviation
 * - *min* - the minimum value
 * - *min-index* - the zero-based index of the minimum value
 * - *max* - the maximum value
 * - *max-index* - the zero-based index of the maximum value
 * - *mean* - the mean value (average)
 * - *median* - the median value
 * - *variance* - the variance per [Welford’s algorithm](https://en.wikipedia.org/wiki/Algorithms_for_calculating_variance#Welford's_online_algorithm)
 * - *mode* - the value with the most occurrences
 * - *pXX* - the percentile value, where XX is a number in [00,99]
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
 * A shorthand functional reducer implementation: given an array of input
 * channel *values*, returns the corresponding reduced output value.
 */
export type ReducerFunction<S = any, T = S> = (values: S[]) => T;

/** A reducer implementation. */
export interface ReducerImplementation<S = any, T = S> {
  /**
   * Given an *index* representing the contents of the current group and the
   * input channel’s array of *values*, returns the corresponding reduced output
   * value. If no input channel is supplied (e.g., as with the *count* reducer)
   * then *values* may be undefined.
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
 */
export type Reducer = ReducerName | ReducerFunction | ReducerImplementation;
