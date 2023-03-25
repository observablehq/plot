import type {ChannelReducers, ChannelValue} from "../channel.js";
import type {RangeInterval} from "../interval.js";
import type {Reducer} from "../reducer.js";
import type {Transformed} from "./basic.js";
import type {GroupOutputOptions} from "./group.js";

/**
 * The built-in thresholds implementations; one of:
 *
 * - *auto* (default) - like *scott*, but capped at 200 bins
 * - *freedman-diaconis* - the [Freedman–Diaconis rule][1]
 * - *scott* - [Scott’s normal reference rule][2]
 * - *sturges* - [Sturges’ formula][3]
 *
 * [1]: https://en.wikipedia.org/wiki/Freedman–Diaconis_rule
 * [2]: https://en.wikipedia.org/wiki/Histogram#Scott.27s_normal_reference_rule
 * [3]: https://en.wikipedia.org/wiki/Histogram#Sturges.27_formula
 */
export type ThresholdsName = "freedman-diaconis" | "scott" | "sturges" | "auto";

/**
 * A functional shorthand thresholds implementation; given an array of observed
 * *values* from the domain, and the *min* and *max* representing the extent of
 * the domain, returns the corresponding desired thresholds as one of:
 *
 * - a range interval
 * - an array of *n* threshold values for *n* - 1 bins
 * - a count representing the desired number of bins (a hint; not guaranteed)
 */
export type ThresholdsFunction<T = any> = (values: T[], min: T, max: T) => RangeInterval<T> | T[] | number;

/**
 * How to subdivide a continuous domain into discrete bins; one of:
 *
 * - a named threshold implementation such as *auto* (default) or *sturges*
 * - a function that returns an array, count, or range interval
 * - a range interval
 * - an array of *n* threshold values for *n* - 1 bins
 * - a count representing the desired number of bins (a hint; not guaranteed)
 *
 * When thresholds are specified as a desired number of bins, or with the
 * built-in thresholds implementations, [d3.ticks][1] is used for numeric
 * domains and [d3.utcTicks][2] is used for temporal domains.
 *
 * [1]: https://github.com/d3/d3-array/blob/main/README.md#ticks
 * [2]: https://github.com/d3/d3-time/blob/main/README.md#utcTicks
 */
export type Thresholds<T = any> = ThresholdsName | ThresholdsFunction<T> | RangeInterval<T> | T[] | number;

/** Options for the bin transform. */
export interface BinOptions {
  /**
   * If false or zero (default), produce a frequency distribution; if true or a
   * positive number, produce a cumulative distribution; if a negative number,
   * produce a [complementary cumulative][1] distribution.
   *
   * [1]: https://en.wikipedia.org/wiki/Cumulative_distribution_function#Complementary_cumulative_distribution_function_.28tail_distribution.29
   */
  cumulative?: boolean | number;

  /**
   * The domain of allowed values; optional. If specified as [*min*, *max*],
   * values outside this extent will be ignored. If a function, it is passed the
   * observed input values and must return the domain [*min*, *max*]. When
   * **thresholds** are specified as an interval and no domain is specified, the
   * effective domain will be extended to align with the interval.
   */
  domain?: ((values: any[]) => [min: any, max: any]) | [min: any, max: any];

  /**
   * How to subdivide the domain into discrete bins; defaults to *auto*; one of:
   *
   * - a named threshold implementation such as *auto* (default) or *sturges*
   * - a function that returns an array, count, or range interval
   * - a range interval
   * - an array of *n* threshold values for *n* - 1 bins
   * - a count representing the desired number of bins (a hint; not guaranteed)
   *
   * For example, for about ten bins:
   *
   * ```js
   * Plot.rectY(numbers, Plot.binX({y: "count"}, {thresholds: 10}))
   * ```
   */
  thresholds?: Thresholds;

  /**
   * How to subdivide the domain into discrete bins; a stricter alternative to
   * the **thresholds** option allowing the use of shorthand numeric intervals;
   * one of:
   *
   * - an object that implements *floor*, *offset*, and *range* methods
   * - a named time interval such as *day* (for date intervals)
   * - a number (for number intervals), defining intervals at integer multiples of *n*
   *
   * For example, for integer bins:
   *
   * ```js
   * Plot.rectY(numbers, Plot.binX({y: "count"}, {interval: 1}))
   * ```
   */
  interval?: RangeInterval;
}

/**
 * How to reduce binned values; one of:
 *
 * - a generic reducer name, such as *count* or *first*
 * - *x* - the middle of the bin’s **x** extent (when binning on **x**)
 * - *x1* - the lower bound of the bin’s **x** extent (when binning on **x**)
 * - *x2* - the upper bound of the bin’s **x** extent (when binning on **x**)
 * - *y* - the middle of the bin’s **y** extent (when binning on **y**)
 * - *y1* - the lower bound of the bin’s **y** extent (when binning on **y**)
 * - *y2* - the upper bound of the bin’s **y** extent (when binning on **y**)
 * - a function that takes an array of values and returns the reduced value
 * - an object that implements the *reduceIndex* method
 *
 * When a reducer function or implementation is used with the bin transform, it
 * is passed the bin extent {x1, x2, y1, y2} as an additional argument.
 */
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

/**
 * A shorthand functional bin reducer implementation: given an array of input
 * channel *values*, and the current bin’s *extent*, returns the corresponding
 * reduced output value.
 */
export type BinReducerFunction<S = any, T = S> = (values: S[], extent: {x1: any; y1: any; x2: any; y2: any}) => T;

/** A bin reducer implementation. */
export interface BinReducerImplementation<S = any, T = S> {
  /**
   * Given an *index* representing the contents of the current bin, the input
   * channel’s array of *values*, and the current bin’s *extent*, returns the
   * corresponding reduced output value. If no input channel is supplied (e.g.,
   * as with the *count* reducer) then *values* may be undefined.
   */
  reduceIndex(index: number[], values: S[], extent: {x1: any; y1: any; x2: any; y2: any}): T;
  // TODO scope
  // TODO label
}

/**
 * When binning on **x** or **y**, you can specify the channel values as a
 * {value} object to provide separate bin options for each.
 */
export type ChannelValueBinSpec = ChannelValue | ({value: ChannelValue} & BinOptions);

/** Inputs to the binX transform. */
export type BinXInputs<T> = Omit<T, "x"> & {x?: ChannelValueBinSpec} & BinOptions;

/** Inputs to the binY transform. */
export type BinYInputs<T> = Omit<T, "y"> & {y?: ChannelValueBinSpec} & BinOptions;

/** Inputs to the bin transform. */
export type BinInputs<T> = Omit<T, "x" | "y"> & {x?: ChannelValueBinSpec; y?: ChannelValueBinSpec} & BinOptions;

/** Output channels (and options) for the bin transform. */
export type BinOutputs = ChannelReducers<BinReducer> & GroupOutputOptions<BinReducer> & BinOptions;

/**
 * Bins on the **x** channel; then subdivides bins on the first channel of
 * **z**, **fill**, or **stroke**, if any; then further subdivides bins on the
 * **y** channel, if any and if none of **y**, **y1**, and **y2** are in
 * *outputs*; and lastly for each channel in the specified *outputs*, applies
 * the corresponding *reduce* method to produce new channel values from the
 * binned input channel values. Each *reduce* method may be one of:
 *
 * - a named reducer implementation such as *count* or *sum*
 * - a function that takes an array of values and returns the reduced value
 * - an object that implements the *reduceIndex* method
 *
 * For example, for a histogram of observed culmen lengths:
 *
 * ```js
 * Plot.rectY(penguins, Plot.binX({y: "count"}, {x: "culmen_length_mm"}))
 * ```
 *
 * The binX transform is often used with the rectY mark to make histograms; it
 * is intended for aggregating continuous quantitative or temporal data, such as
 * temperatures or times, into discrete bins. See the groupX transform for
 * ordinal or categorical data.
 *
 * If **x** is not in *options*, it defaults to identity. If **x** is not in
 * *outputs*, by default produces **x1** and **x2** output channels representing
 * the extent of each bin and an **x** output channel representing the bin
 * midpoint, say for for labels. If **y** is not in outputs, **y1** and **y2**
 * will be dropped from the returned *options*. The **insetLeft** and
 * **insetRight** options default to 0.5.
 */
export function binX<T>(outputs?: BinOutputs, options?: BinXInputs<T>): Transformed<T>;

/**
 * Bins on the **y** channel; then subdivides bins on the first channel of
 * **z**, **fill**, or **stroke**, if any; then further subdivides bins on the
 * **x** channel, if any and if none of **x**, **x1**, and **x2** are in
 * *outputs*; and lastly for each channel in the specified *outputs*, applies
 * the corresponding *reduce* method to produce new channel values from the
 * binned input channel values. Each *reduce* method may be one of:
 *
 * - a named reducer implementation such as *count* or *sum*
 * - a function that takes an array of values and returns the reduced value
 * - an object that implements the *reduceIndex* method
 *
 * For example, for a histogram of observed culmen lengths:
 *
 * ```js
 * Plot.rectX(penguins, Plot.binY({x: "count"}, {y: "culmen_length_mm"}))
 * ```
 *
 * The binY transform is often used with the rectX mark to make histograms; it
 * is intended for aggregating continuous quantitative or temporal data, such as
 * temperatures or times, into discrete bins. See the groupY transform for
 * ordinal or categorical data.
 *
 * If **y** is not in *options*, it defaults to identity. If **y** is not in
 * *outputs*, by default produces **y1** and **y2** output channels representing
 * the extent of each bin and a **y** output channel representing the bin
 * midpoint, say for for labels. If **x** is not in outputs, **x1** and **x2**
 * will be dropped from the returned *options*. The **insetTop** and
 * **insetBottom** options default to 0.5.
 */
export function binY<T>(outputs?: BinOutputs, options?: BinYInputs<T>): Transformed<T>;

/**
 * Bins on the **x** and **y** channels; then subdivides bins on the first
 * channel of **z**, **fill**, or **stroke**, if any; and lastly for each
 * channel in the specified *outputs*, applies the corresponding *reduce* method
 * to produce new channel values from the binned input channel values. Each
 * *reduce* method may be one of:
 *
 * - a named reducer implementation such as *count* or *sum*
 * - a function that takes an array of values and returns the reduced value
 * - an object that implements the *reduceIndex* method
 *
 * For example, for a heatmap of observed culmen lengths and depths:
 *
 * ```js
 * Plot.rect(penguins, Plot.bin({fill: "count"}, {x: "culmen_depth_mm", y: "culmen_length_mm"}))
 * ```
 *
 * The bin transform is often used with the rect mark to make heatmaps; it is
 * intended for aggregating continuous quantitative or temporal data, such as
 * temperatures or times, into discrete bins. See the group transform for
 * ordinal or categorical data.
 *
 * If neither **x** nor **y** are in *options*, then **x** and **y** default to
 * accessors assuming that *data* contains tuples [[*x₀*, *y₀*], [*x₁*, *y₁*],
 * [*x₂*, *y₂*], …]. If **x** is not in *outputs*, by default produces **x1**
 * and **x2** output channels representing the horizontal extent of each bin and
 * a **x** output channel representing the horizontal midpoint, say for for
 * labels. Likewise if **y** is not in *outputs*, by default produces **y1** and
 * **y2** output channels representing the vertical extent of each bin and a
 * **y** output channel representing the vertical midpoint. The **insetTop**,
 * **insetRight**, **insetBottom**, and **insetLeft** options default to 0.5.
 */
export function bin<T>(outputs?: BinOutputs, options?: BinInputs<T>): Transformed<T>;
