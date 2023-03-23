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

export type NormalizeBasisFunction = (index: number[], values: any[]) => number;

/** How to normalize series values. */
export type NormalizeBasis = NormalizeBasisName | NormalizeBasisFunction;

/** Options for the normalize transform. */
export interface NormalizeOptions {
  basis?: NormalizeBasis;
}

/**
 * Groups data into series using the first channel of *z*, *fill*, or *stroke*
 * (if any), then derives new *x*, *x1*, and *x2* channels for each
 * corresponding input channel by normalizing to the given *basis*. For example,
 * if the series values are [*x₀*, *x₁*, *x₂*, …] and the *first* basis is used,
 * the derived series values would be [*x₀* / *x₀*, *x₁* / *x₀*, *x₂* / *x₀*, …]
 * as in an index chart.
 *
 * The **basis** option specifies how to normalize series values. It can be:
 *
 * * *first* (default) - the first value, as in an index chart
 * * *last* - the last value
 * * *min* - the minimum value
 * * *max* - the maximum value
 * * *mean* - the mean value (average)
 * * *median* - the median value
 * * *pXX* - the percentile value, where XX is a number in [00,99]
 * * *sum* - the sum of values
 * * *extent* - the minimum is mapped to zero, and the maximum to one
 * * *deviation* - subtract the mean, then divide by the standard deviation
 * * a function to be passed an array of series values, returning a number
 */
export function normalizeX<T>(options?: T & NormalizeOptions): Transformed<T>;
export function normalizeX<T>(basis?: NormalizeBasis, options?: T): Transformed<T>;

/**
 * Groups data into series using the first channel of *z*, *fill*, or *stroke*
 * (if any), then derives new *y*, *y1*, and *y2* channels for each
 * corresponding input channel by normalizing to the given *basis*. For example,
 * if the series values are [*y₀*, *y₁*, *y₂*, …] and the *first* basis is used,
 * the derived series values would be [*y₀* / *y₀*, *y₁* / *y₀*, *y₂* / *y₀*, …]
 * as in an index chart.
 *
 * The **basis** option specifies how to normalize series values. It can be:
 *
 * * *first* (default) - the first value, as in an index chart
 * * *last* - the last value
 * * *min* - the minimum value
 * * *max* - the maximum value
 * * *mean* - the mean value (average)
 * * *median* - the median value
 * * *pXX* - the percentile value, where XX is a number in [00,99]
 * * *sum* - the sum of values
 * * *extent* - the minimum is mapped to zero, and the maximum to one
 * * *deviation* - subtract the mean, then divide by the standard deviation
 * * a function to be passed an array of series values, returning a number
 */
export function normalizeY<T>(options?: T & NormalizeOptions): Transformed<T>;
export function normalizeY<T>(basis?: NormalizeBasis, options?: T): Transformed<T>;

/**
 * Given a normalize *basis*, returns a corresponding map implementation for use
 * with the map transform, allowing the normalization of arbitrary channels
 * instead of only *x* and *y*. For example, to normalize the *title* channel:
 *
 * ```js
 * Plot.map({title: Plot.normalize("first")}, {x: "Date", title: "Close", stroke: "Symbol"})
 * ```
 *
 * The **basis** option specifies how to normalize series values. It can be:
 *
 * * *first* (default) - the first value, as in an index chart
 * * *last* - the last value
 * * *min* - the minimum value
 * * *max* - the maximum value
 * * *mean* - the mean value (average)
 * * *median* - the median value
 * * *pXX* - the percentile value, where XX is a number in [00,99]
 * * *sum* - the sum of values
 * * *extent* - the minimum is mapped to zero, and the maximum to one
 * * *deviation* - subtract the mean, then divide by the standard deviation
 * * a function to be passed an array of series values, returning a number
 */
export function normalize(basis: NormalizeBasis): Map;
