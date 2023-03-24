import type {ChannelReducers} from "../channel.js";
import type {Reducer} from "../reducer.js";
import type {Transformed} from "./basic.js";

export interface GroupOutputOptions {
  /**
   * The data reducer; defaults to the subset of data corresponding to the
   * group in input order.
   */
  data?: Reducer | null;
  /**
   * The filter reducer, defaults to a check on empty groups. Use null to return
   * all groups, for example to impute sum=0 for a line chart.
   */
  filter?: Reducer | null;
  /**
   * The order in which the groups are generated.
   */
  sort?: Reducer | null;
  /**
   * Reverse the order in which the groups are generated.
   */
  reverse?: boolean;
}

export type GroupOutputs = ChannelReducers & GroupOutputOptions;

/**
 * Aggregates ordinal or categorical data—such as names—into groups and then
 * computes summary statistics for each group such as a count or sum. Groups are
 * computed on the first channel of *z*, *fill*, or *stroke*, if any. If none of
 * *z*, *fill*, or *stroke* are channels, then all data (within each facet) is
 * placed into a single group.
 *
 * ```js
 * Plot.groupZ({x: "proportion"}, {fill: "species"})
 * ```
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
 * Most aggregation methods require binding the output channel to an input
 * channel; for example, if you want the **r** output channel to be a *sum* (not
 * merely a count), there should be a corresponding **r** input channel
 * specifying which values to sum.
 *
 * You can control whether a channel is computed before or after grouping. If a
 * channel is declared only in *options* (and it is not a special group-eligible
 * channel such as *x*, *y*, *z*, *fill*, or *stroke*), it will be computed
 * after grouping and be passed the grouped data: each datum is the array of
 * input data corresponding to the current group.
 *
 * The default reducer for the **title** channel returns a summary list of the
 * top 5 values with the corresponding number of occurrences.
 *
 * See also **groupX**, **groupY**, and **group** if you need to group by *x*,
 * *y*, or both.
 */
export function groupZ<T>(outputs?: GroupOutputs, options?: T): Transformed<T>;

/**
 * Aggregates ordinal or categorical data—such as names—into groups and then
 * computes summary statistics for each group such as a count or sum. Typically
 * used with the **barY** mark for a categorical histogram. Groups are computed
 * on *x* and the first channel of *z*, *fill*, or *stroke*, if any.
 *
 * ```js
 * Plot.groupX({y: "sum"}, {x: "species", y: "body_mass_g"})
 * ```
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
 * Most aggregation methods require binding the output channel to an input
 * channel; for example, if you want the **r** output channel to be a *sum* (not
 * merely a count), there should be a corresponding **r** input channel
 * specifying which values to sum.
 *
 * You can control whether a channel is computed before or after grouping. If a
 * channel is declared only in *options* (and it is not a special group-eligible
 * channel such as *x*, *y*, *z*, *fill*, or *stroke*), it will be computed
 * after grouping and be passed the grouped data: each datum is the array of
 * input data corresponding to the current group.
 *
 * The default reducer for the **title** channel returns a summary list of the
 * top 5 values with the corresponding number of occurrences.
 *
 * The outputs may also include *filter* and *sort* options (with *reverse*) to
 * specify which groups are generated. Use filter: null to generate empty
 * groups, for example to impute sum=0 for a line chart. The *sort* option can
 * also target the domain of an associated scale such as *x*, *fx* or *fy*.
 *
 * See also **groupZ**, **groupY**, and **group** if you need to group by
 * series, *y*, or both *x* and *y*.
 */
export function groupX<T>(outputs?: GroupOutputs, options?: T): Transformed<T>;

/**
 * Aggregates ordinal or categorical data—such as names—into groups and then
 * computes summary statistics for each group such as a count or sum. Typically
 * used with the **barX** mark for a categorical histogram. Groups are computed
 * on *y* and the first channel of *z*, *fill*, or *stroke*, if any.
 *
 * ```js
 * Plot.groupY({x: "sum"}, {y: "species", x: "body_mass_g"})
 * ```
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
 * Most aggregation methods require binding the output channel to an input
 * channel; for example, if you want the **r** output channel to be a *sum* (not
 * merely a count), there should be a corresponding **r** input channel
 * specifying which values to sum.
 *
 * You can control whether a channel is computed before or after grouping. If a
 * channel is declared only in *options* (and it is not a special group-eligible
 * channel such as *x*, *y*, *z*, *fill*, or *stroke*), it will be computed
 * after grouping and be passed the grouped data: each datum is the array of
 * input data corresponding to the current group.
 *
 * The default reducer for the **title** channel returns a summary list of the
 * top 5 values with the corresponding number of occurrences.
 *
 * The outputs may also include *filter* and *sort* options (with *reverse*) to
 * specify which groups are generated. Use filter: null to generate empty
 * groups, for example to impute sum=0 for a line chart. The *sort* option can
 * also target the domain of an associated scale such as *y*, *fx* or *fy*.
 *
 * See also **groupZ**, **groupX**, and **group** if you need to group by
 * series, *x*, or both *x* and *y*.
 */
export function groupY<T>(outputs?: GroupOutputs, options?: T): Transformed<T>;

/**
 * Aggregates ordinal or categorical data—such as names—into groups and then
 * computes summary statistics for each group such as a count or sum. Typically
 * used with the **cell** mark for a categorical heatmap. Groups are computed on
 * *x* and *y*, and the first channel of *z*, *fill*, or *stroke*, if any.
 *
 * ```js
 * Plot.group({fill: "count"}, {x: "island", y: "species"})
 * ```
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
 * Most aggregation methods require binding the output channel to an input
 * channel; for example, if you want the **r** output channel to be a *sum* (not
 * merely a count), there should be a corresponding **r** input channel
 * specifying which values to sum.
 *
 * You can control whether a channel is computed before or after grouping. If a
 * channel is declared only in *options* (and it is not a special group-eligible
 * channel such as *x*, *y*, *z*, *fill*, or *stroke*), it will be computed
 * after grouping and be passed the grouped data: each datum is the array of
 * input data corresponding to the current group.
 *
 * The default reducer for the **title** channel returns a summary list of the
 * top 5 values with the corresponding number of occurrences.
 *
 * The outputs may also include *filter* and *sort* options (with *reverse*) to
 * specify which groups are generated. Use filter: null to generate empty
 * groups, for example to impute sum=0 for empty cells.
 *
 * See also **groupZ**, **groupX**, and **groupY** if you need to group by
 * series, *x*, or *y*.
 */
export function group<T>(outputs?: GroupOutputs, options?: T): Transformed<T>;
