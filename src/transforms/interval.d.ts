import type {Interval} from "../interval.js";
import type {Transformed} from "./basic.js";
import type {Map} from "./map.js";

/** Options for the interval transform. */
export interface IntervalOptions {
  /**
   * How to quantize the continuous data; one of:
   *
   * - an object that implements *floor* and *offset* methods
   * - a named time interval such as *day* (for date intervals)
   * - a number (for number intervals), defining intervals at integer multiples of *n*
   *
   * For example, for integer bins:
   *
   * ```js
   * Plot.barY(numbers, Plot.groupX({y: "count"}, Plot.intervalX(1)))
   * ```
   */
  interval?: Interval;
}

/**
 * Derives new **x**, **x1**, and **x2** channels for each corresponding input
 * channel by quantizing to the given *interval*.
 */
export function intervalX<T>(interval?: Interval, options?: T): Transformed<T>;
export function intervalX<T>(options?: T & IntervalOptions): Transformed<T>;

/**
 * Derives new **y**, **y1**, and **y2** channels for each corresponding input
 * channel by quantizing to the given *interval*.
 */
export function intervalY<T>(interval?: Interval, options?: T): Transformed<T>;
export function intervalY<T>(options?: T & IntervalOptions): Transformed<T>;

/**
 * Given an *interval*, returns a corresponding map implementation for use with
 * the map transform, allowing the normalization of arbitrary channels instead
 * of only **x** and **y**. For example, to interval the **stroke** channel:
 *
 * ```js
 * Plot.map({stroke: Plot.intervalMap(10)}, {x: "Date", stroke: "Close", stroke: "Symbol"})
 * ```
 */
export function intervalMap(interval: Interval): Map;
