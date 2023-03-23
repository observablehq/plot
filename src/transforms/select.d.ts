import type {ChannelValue} from "../channel.js";
import type {Transformed} from "./basic.js";

export type SelectorName = "first" | "last" | "min" | "max"; // TODO restrict based on context

export type SelectorFunction = (index: number[], values: any[] | null) => number[];

export type SelectorChannel<T> = {[key in keyof T]?: SelectorName | SelectorFunction};

/** How to select points within each series. */
export type Selector<T> = SelectorName | SelectorFunction | SelectorChannel<T>;

/** Options for the select transform. */
export interface SelectOptions {
  z?: ChannelValue;
}

/**
 * Groups points into series according to the *z* channel, or the *fill* or
 * *stroke* channel if no *z* channel is provided, then selects points from each
 * series based on the given selector. The selector can be specified as:
 *
 * - *first* - the first point by input order
 * - *last* - the last point by input order
 * - a {*channel*: *min*} object - the minimum point by the given *channel*’s value
 * - a {*channel*: *max*} object - the maximum point by the given *channel*’s value
 * - a {*channel*: function} object to filter based on series index and channel values
 * - a function to filter based on series index
 *
 * For example to select the maximum point of the *y* channel, like selectMaxY:
 *
 * ```js
 * Plot.text(data, Plot.select({y: "max"}, options))
 * ```
 *
 * When the selector is specified as a function, it is passed the index of each
 * series as input, along with channel values if a *channel* name was given; it
 * must return the corresponding index of selected points (a subset of the
 * passed-in index).
 */
export function select<T>(selector: Selector<T>, options?: T & SelectOptions): Transformed<T>;

/**
 * Groups points into series according to the *z* channel, or the *fill* or
 * *stroke* channel if no *z* channel is provided, and then selects the first
 * point from each series in input order.
 */
export function selectFirst<T>(options?: T & SelectOptions): Transformed<T>;

/**
 * Groups points into series according to the *z* channel, or the *fill* or
 * *stroke* channel if no *z* channel is provided, and then selects the last
 * point from each series in input order.
 */
export function selectLast<T>(options?: T & SelectOptions): Transformed<T>;

/**
 * Groups points into series according to the *z* channel, or the *fill* or
 * *stroke* channel if no *z* channel is provided, and then selects the minimum
 * point from each series based on *x* channel value.
 */
export function selectMinX<T>(options?: T & SelectOptions): Transformed<T>;

/**
 * Groups points into series according to the *z* channel, or the *fill* or
 * *stroke* channel if no *z* channel is provided, and then selects the minimum
 * point from each series based on *y* channel value.
 */
export function selectMinY<T>(options?: T & SelectOptions): Transformed<T>;

/**
 * Groups points into series according to the *z* channel, or the *fill* or
 * *stroke* channel if no *z* channel is provided, and then selects the maximum
 * point from each series based on *x* channel value.
 */
export function selectMaxX<T>(options?: T & SelectOptions): Transformed<T>;

/**
 * Groups points into series according to the *z* channel, or the *fill* or
 * *stroke* channel if no *z* channel is provided, and then selects the maximum
 * point from each series based on *y* channel value.
 */
export function selectMaxY<T>(options?: T & SelectOptions): Transformed<T>;
