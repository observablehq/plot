import type {ChannelValue} from "../channel.js";
import type {Transformed} from "./basic.js";

/**
 * How to select points within each series; one of:
 *
 * - *first* - the first point by input order
 * - *last* - the last point by input order
 * - a {*channel*: *min*} object - the minimum point by channel value
 * - a {*channel*: *max*} object - the maximum point by channel value
 * - a {*channel*: function} object to filter by series index and channel values
 * - a function to filter by series index
 *
 * A selector function is given an *index* representing the contents of the
 * current series, the input channel’s array of *source* values (if a channel is
 * specified), and returns the corresponding subset of *index* to be selected.
 */
export type Selector<T> =
  | "first"
  | "last"
  | ((index: number[]) => number[])
  | {[key in keyof T]?: "min" | "max" | ((index: number[], values: any[]) => number[])};

/** Options for the select transform. */
export interface SelectOptions {
  /**
   * How to group data into series. If not specified, series will be determined
   * by the **fill** channel, if any, or the **stroke** channel, if any.
   */
  z?: ChannelValue;
}

/**
 * Groups on the first channel of **z**, **fill**, or **stroke**, if any, and
 * then selects points from each series based on the given *selector*. For
 * example to select the maximum point of the **y** channel, as selectMaxY:
 *
 * ```js
 * Plot.text(data, Plot.select({y: "max"}, options))
 * ```
 */
export function select<T>(selector: Selector<T>, options?: T & SelectOptions): Transformed<T>;

/**
 * Groups on the first channel of **z**, **fill**, or **stroke**, if any, and
 * then selects the first point from each series in input order.
 */
export function selectFirst<T>(options?: T & SelectOptions): Transformed<T>;

/**
 * Groups on the first channel of **z**, **fill**, or **stroke**, if any, and
 * then selects the last point from each series in input order.
 */
export function selectLast<T>(options?: T & SelectOptions): Transformed<T>;

/**
 * Groups on the first channel of **z**, **fill**, or **stroke**, if any, and
 * then selects the minimum point from each series based on **x** channel value.
 */
export function selectMinX<T>(options?: T & SelectOptions): Transformed<T>;

/**
 * Groups on the first channel of **z**, **fill**, or **stroke**, if any, and
 * then selects the minimum point from each series based on **y** channel value.
 */
export function selectMinY<T>(options?: T & SelectOptions): Transformed<T>;

/**
 * Groups on the first channel of **z**, **fill**, or **stroke**, if any, and
 * then selects the maximum point from each series based on **x** channel value.
 */
export function selectMaxX<T>(options?: T & SelectOptions): Transformed<T>;

/**
 * Groups on the first channel of **z**, **fill**, or **stroke**, if any, and
 * then selects the maximum point from each series based on **y** channel value.
 */
export function selectMaxY<T>(options?: T & SelectOptions): Transformed<T>;
