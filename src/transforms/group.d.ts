import type {ChannelReducers} from "../channel.js";
import type {Reducer} from "../reducer.js";
import type {Transformed} from "./basic.js";

/** Options for outputs of the group transform. */
export interface GroupOutputOptions {
  /**
   * How to reduce data; defaults to the identity reducer, outputting the array
   * of data for each group in input order.
   */
  data?: Reducer;

  /**
   * How to filter groups: if the reducer emits a falsey value, the group will
   * be dropped; by default, empty groups are dropped. Use null to disable
   * filtering and return all groups, for example to impute missing zeroes when
   * summing values for a line chart.
   */
  filter?: Reducer | null;

  /**
   * How to order groups; if null (default), groups are returned in ascending
   * natural order along *x*, *y*, and *z* (or *fill* or *stroke*). Group order
   * affects draw order of overlapping marks, and may be useful in conjunction
   * with the stack transform which defaults to input order. For example to
   * place the smallest group within each stack on the baseline:
   *
   * ```js
   * Plot.groupX({y: "count", sort: "count"}, {fill: "sex", x: "sport"})
   * ```
   */
  sort?: Reducer | null;

  /** If true, reverse the order of generated groups; defaults to false. */
  reverse?: boolean;
}

/** How to reduce grouped channel values. */
export type GroupOutputs = ChannelReducers & GroupOutputOptions;

/**
 * Groups on the first channel of *z*, *fill*, or *stroke*, if any, and then for
 * each channel in the specified *outputs*, applies the corresponding *reduce*
 * method to produce new channel values from the grouped input channel values.
 * Each *reduce* method may be one of:
 *
 * - a named reducer implementation such as *count* or *sum*
 * - a function that takes an array of values and returns the reduced value
 * - an object that implements the *reduceIndex* method
 *
 * For example, for a horizontal stacked bar chart:
 *
 * ```js
 * Plot.barX(penguins, Plot.groupZ({x: "proportion"}, {fill: "species"}))
 * ```
 *
 * If **title** is not in *outputs* but is in *options*, it defaults to
 * summarizing the most common values. If **href** is not in *output* but is in
 * *options*, it defaults to *first*.
 *
 * Non-grouping channels declared in *options* but not *outputs* are computed on
 * reduced data after grouping, which defaults to the array of data for the
 * current group.
 */
export function groupZ<T>(outputs?: GroupOutputs, options?: T): Transformed<T>;

/**
 * Groups on the *x* input channel; then subdivides groups on the first channel
 * of *z*, *fill*, or *stroke*, if any; and then for each channel in the
 * specified *outputs*, applies the corresponding *reduce* method to produce new
 * channel values from the grouped input channel values. Each *reduce* method
 * may be one of:
 *
 * - a named reducer implementation such as *count* or *sum*
 * - a function that takes an array of values and returns the reduced value
 * - an object that implements the *reduceIndex* method
 *
 * For example, for a vertical bar chart of species by total mass:
 *
 * ```js
 * Plot.barY(penguins, Plot.groupX({y: "sum"}, {x: "species", y: "body_mass_g"}))
 * ```
 *
 * If **x** is not in *options*, it defaults to identity, assuming that the data
 * is ordinal. If **x** is not in *outputs*, it defaults to *first*; the *x1*
 * and *x2* channels, if any, will also be dropped from the returned *options*.
 * If **title** is not in *outputs* but is in *options*, it defaults to
 * summarizing the most common values. If **href** is not in *output* but is in
 * *options*, it defaults to *first*.
 *
 * Non-grouping channels declared in *options* but not *outputs* are computed on
 * reduced data after grouping, which defaults to the array of data for the
 * current group.
 */
export function groupX<T>(outputs?: GroupOutputs, options?: T): Transformed<T>;

/**
 * Groups on the *y* channel; then subdivides groups on the first channel of
 * *z*, *fill*, or *stroke*, if any; and then for each channel in the specified
 * *outputs*, applies the corresponding *reduce* method to produce new channel
 * values from the grouped input channel values. Each *reduce* method may be one
 * of:
 *
 * - a named reducer implementation such as *count* or *sum*
 * - a function that takes an array of values and returns the reduced value
 * - an object that implements the *reduceIndex* method
 *
 * For example, for a vertical bar chart of species by total mass:
 *
 * ```js
 * Plot.barY(penguins, Plot.groupX({y: "sum"}, {x: "species", y: "body_mass_g"}))
 * ```
 *
 * If **y** is not in *options*, it defaults to identity, assuming that the data
 * is ordinal. If **y** is not in *outputs*, it defaults to *first*; the *y1*
 * and *y2* channels, if any, will also be dropped from the returned *options*.
 * If **title** is not in *outputs* but is in *options*, it defaults to
 * summarizing the most common values. If **href** is not in *output* but is in
 * *options*, it defaults to *first*.
 *
 * Non-grouping channels declared in *options* but not *outputs* are computed on
 * reduced data after grouping, which defaults to the array of data for the
 * current group.
 */
export function groupY<T>(outputs?: GroupOutputs, options?: T): Transformed<T>;

/**
 * Groups on the *x* and *y* channels; then subdivides groups on the first
 * channel of *z*, *fill*, or *stroke*, if any; and then for each channel in the
 * specified *outputs*, applies the corresponding *reduce* method to produce new
 * channel values from the grouped input channel values. Each *reduce* method
 * may be one of:
 *
 * - a named reducer implementation such as *count* or *sum*
 * - a function that takes an array of values and returns the reduced value
 * - an object that implements the *reduceIndex* method
 *
 * For example, for a heatmap of penguins by species and island:
 *
 * ```js
 * Plot.cell(penguins, Plot.group({fill: "count"}, {x: "island", y: "species"}))
 * ```
 *
 * If neither **x** nor **y** are in *options*, then **x** and **y** default to
 * accessors assuming that *data* contains tuples [[*x₀*, *y₀*], [*x₁*, *y₁*],
 * [*x₂*, *y₂*], …]. If **x** is not in *outputs*, it defaults to *first*; the
 * *x1* and *x2* channels, if any, will also be dropped from the returned
 * *options*. Likewise if **y** is not in *outputs*, it defaults to *first*; the
 * *y1* and *y2* channels, if any, will also be dropped from the returned
 * *options*. If **title** is not in *outputs* but is in *options*, it defaults
 * to summarizing the most common values. If **href** is not in *output* but is
 * in *options*, it defaults to *first*.
 *
 * Non-grouping channels declared in *options* but not *outputs* are computed on
 * reduced data after grouping, which defaults to the array of data for the
 * current group.
 */
export function group<T>(outputs?: GroupOutputs, options?: T): Transformed<T>;
