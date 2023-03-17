import type {ReducerPercentile} from "../reducer.js";
import type {Transformed} from "./basic.js";
import type {Map} from "./map.js";

export type NormalizeBasisName =
  | "deviation"
  | "first"
  | "last"
  | "max"
  | "mean"
  | "median"
  | "min"
  | "sum"
  | "extent"
  | ReducerPercentile;

export type NormalizeBasisFunction = (index: number[], values: any[]) => any;

export type NormalizeBasis = NormalizeBasisName | NormalizeBasisFunction;

export interface NormalizeOptions {
  basis?: NormalizeBasis;
}

/**
 * Normalize series values relative to the given basis. For example, if the
 * series values are [*x₀*, *x₁*, *x₂*, …] and the *first* basis is used, the
 * mapped series values would be [*x₀* / *x₀*, *x₁* / *x₀*, *x₂* / *x₀*, …] as
 * in an index chart. The **basis** option specifies how to normalize the series
 * values.
 *
 * The following basis methods are supported:
 *
 * * *first* - the first value, as in an index chart; the default
 * * *last* - the last value
 * * *min* - the minimum value
 * * *max* - the maximum value
 * * *mean* - the mean value (average)
 * * *median* - the median value
 * * *pXX* - the percentile value, where XX is a number in [00,99]
 * * *sum* - the sum of values
 * * *extent* - the minimum is mapped to zero, and the maximum to one
 * * *deviation* - each value is transformed by subtracting the mean and then dividing by the standard deviation
 * * a function to be passed an array of values, returning the desired basis
 */
export function normalizeX<T>(options?: T & NormalizeOptions): Transformed<T>;

/**
 * Normalize series values relative to the given basis. For example, if the
 * series values are [*x₀*, *x₁*, *x₂*, …] and the *first* basis is used, the
 * mapped series values would be [*x₀* / *x₀*, *x₁* / *x₀*, *x₂* / *x₀*, …] as
 * in an index chart. The **basis** option specifies how to normalize the series
 * values.
 *
 * The following basis methods are supported:
 *
 * * *first* - the first value, as in an index chart; the default
 * * *last* - the last value
 * * *min* - the minimum value
 * * *max* - the maximum value
 * * *mean* - the mean value (average)
 * * *median* - the median value
 * * *pXX* - the percentile value, where XX is a number in [00,99]
 * * *sum* - the sum of values
 * * *extent* - the minimum is mapped to zero, and the maximum to one
 * * *deviation* - each value is transformed by subtracting the mean and then dividing by the standard deviation
 * * a function to be passed an array of values, returning the desired basis
 */
export function normalizeX<T>(basis?: NormalizeBasis, options?: T): Transformed<T>;

/**
 * Normalize series values relative to the given basis. For example, if the
 * series values are [*y₀*, *y₁*, *y₂*, …] and the *first* basis is used, the
 * mapped series values would be [*y₀* / *y₀*, *y₁* / *y₀*, *y₂* / *y₀*, …] as
 * in an index chart. The **basis** option specifies how to normalize the series
 * values.
 *
 * The following basis methods are supported:
 *
 * * *first* - the first value, as in an index chart; the default
 * * *last* - the last value
 * * *min* - the minimum value
 * * *max* - the maximum value
 * * *mean* - the mean value (average)
 * * *median* - the median value
 * * *pXX* - the percentile value, where XX is a number in [00,99]
 * * *sum* - the sum of values
 * * *extent* - the minimum is mapped to zero, and the maximum to one
 * * *deviation* - each value is transformed by subtracting the mean and then dividing by the standard deviation
 * * a function to be passed an array of values, returning the desired basis
 */
export function normalizeY<T>(options?: T & NormalizeOptions): Transformed<T>;

/**
 * Normalize series values relative to the given basis. For example, if the
 * series values are [*y₀*, *y₁*, *y₂*, …] and the *first* basis is used, the
 * mapped series values would be [*y₀* / *y₀*, *y₁* / *y₀*, *y₂* / *y₀*, …] as
 * in an index chart. The **basis** option specifies how to normalize the series
 * values.
 *
 * The following basis methods are supported:
 *
 * * *first* - the first value, as in an index chart; the default
 * * *last* - the last value
 * * *min* - the minimum value
 * * *max* - the maximum value
 * * *mean* - the mean value (average)
 * * *median* - the median value
 * * *pXX* - the percentile value, where XX is a number in [00,99]
 * * *sum* - the sum of values
 * * *extent* - the minimum is mapped to zero, and the maximum to one
 * * *deviation* - each value is transformed by subtracting the mean and then dividing by the standard deviation
 * * a function to be passed an array of values, returning the desired basis
 */
export function normalizeY<T>(basis?: NormalizeBasis, options?: T): Transformed<T>;

/**
 * Returns a normalize map method for the given *basis*, suitable for use with Plot.map.
 *
 * The following basis methods are supported:
 *
 * * *first* - the first value, as in an index chart; the default
 * * *last* - the last value
 * * *min* - the minimum value
 * * *max* - the maximum value
 * * *mean* - the mean value (average)
 * * *median* - the median value
 * * *pXX* - the percentile value, where XX is a number in [00,99]
 * * *sum* - the sum of values
 * * *extent* - the minimum is mapped to zero, and the maximum to one
 * * *deviation* - each value is transformed by subtracting the mean and then dividing by the standard deviation
 * * a function to be passed an array of values, returning the desired basis
 *
 * ```js
 * Plot.map({y: Plot.normalize("first")}, {x: "Date", y: "Close", stroke: "Symbol"})
 * ```
 */
export function normalize(basis: NormalizeBasis): Map;
