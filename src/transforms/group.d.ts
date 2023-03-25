import type {ChannelReducers} from "../channel.js";
import type {Reducer} from "../reducer.js";
import type {Transformed} from "./basic.js";

/** Options for outputs of the group (and bin) transform. */
export interface GroupOutputOptions<T = Reducer> {
  /**
   * How to reduce data; defaults to the identity reducer, outputting the subset
   * of data for each group in input order.
   */
  data?: T;

  /**
   * How to filter groups: if the reducer emits a falsey value, the group will
   * be dropped; by default, empty groups are dropped. Use null to disable
   * filtering and return all groups, for example to impute missing zeroes when
   * summing values for a line chart.
   */
  filter?: T | null;

  /**
   * How to order groups; if null (default), groups are returned in ascending
   * natural order along *x*, *y*, and *z* (or *fill* or *stroke*). Group order
   * affects draw order of overlapping marks, and may be useful with the stack
   * transform which defaults to input order. For example to place the smallest
   * group within each stack on the baseline:
   *
   * ```js
   * Plot.groupX({y: "count", sort: "count"}, {fill: "sex", x: "sport"})
   * ```
   */
  sort?: T | null;

  /** If true, reverse the order of generated groups; defaults to false. */
  reverse?: boolean;
}

/** Output channels (and options) for the group transform. */
export type GroupOutputs = ChannelReducers & GroupOutputOptions;

/**
 * Groups on the first channel of **z**, **fill**, or **stroke**, if any, and
 * then for each channel in the specified *outputs*, applies the corresponding
 * *reduce* method to produce new channel values from the grouped input channel
 * values. Each *reduce* method may be one of:
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
 */
export function groupZ<T>(outputs?: GroupOutputs, options?: T): Transformed<T>;

/**
 * Groups on the **x** channel; then subdivides groups on the first channel of
 * **z**, **fill**, or **stroke**, if any; and then for each channel in the
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
 * The groupX transform is often used with the barY mark to make bar charts; it
 * is intended for aggregating ordinal or categorical data, such as names. See
 * the binX transform for continuous data.
 *
 * If **x** is not in *options*, it defaults to identity. If **x** is not in
 * *outputs*, it defaults to *first*, and the **x1** and **x2** channels, if
 * any, will be dropped from the returned *options*.
 */
export function groupX<T>(outputs?: GroupOutputs, options?: T): Transformed<T>;

/**
 * Groups on the **y** channel; then subdivides groups on the first channel of
 * **z**, **fill**, or **stroke**, if any; and then for each channel in the
 * specified *outputs*, applies the corresponding *reduce* method to produce new
 * channel values from the grouped input channel values. Each *reduce* method
 * may be one of:
 *
 * - a named reducer implementation such as *count* or *sum*
 * - a function that takes an array of values and returns the reduced value
 * - an object that implements the *reduceIndex* method
 *
 * For example, for a horizontal bar chart of species by total mass:
 *
 * ```js
 * Plot.barX(penguins, Plot.groupY({x: "sum"}, {y: "species", x: "body_mass_g"}))
 * ```
 *
 * The groupY transform is often used with the barX mark to make bar charts; it
 * is intended for aggregating ordinal or categorical data, such as names. See
 * the binY transform for continuous data.
 *
 * If **y** is not in *options*, it defaults to identity. If **y** is not in
 * *outputs*, it defaults to *first*, and the **y1** and **y2** channels, if
 * any, will be dropped from the returned *options*.
 */
export function groupY<T>(outputs?: GroupOutputs, options?: T): Transformed<T>;

/**
 * Groups on the **x** and **y** channels; then subdivides groups on the first
 * channel of **z**, **fill**, or **stroke**, if any; and then for each channel
 * in the specified *outputs*, applies the corresponding *reduce* method to
 * produce new channel values from the grouped input channel values. Each
 * *reduce* method may be one of:
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
 * The group transform is often used with the cell mark to make heatmaps; it is
 * intended for aggregating ordinal or categorical data, such as names. See the
 * bin transform for continuous data.
 *
 * If neither **x** nor **y** are in *options*, then **x** and **y** default to
 * accessors assuming that *data* contains tuples [[*x₀*, *y₀*], [*x₁*, *y₁*],
 * [*x₂*, *y₂*], …]. If **x** is not in *outputs*, it defaults to *first*, and
 * the **x1** and **x2** channels, if any, will be dropped from the returned
 * *options*. Likewise if **y** is not in *outputs*, it defaults to *first*, and
 * the **y1** and **y2** channels, if any, will be dropped from the returned
 * *options*.
 */
export function group<T>(outputs?: GroupOutputs, options?: T): Transformed<T>;
