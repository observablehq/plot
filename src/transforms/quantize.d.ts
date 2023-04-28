import {ChannelName} from "channel.js";
import type {Interval} from "../interval.js";
import type {Transformed} from "./basic.js";
import type {Map} from "./map.js";

/** Options for the quantize transform. */
export interface QuantizeOptions {
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
   * Plot.barY(numbers, Plot.groupX({y: "count"}, Plot.quantizeX(1)))
   * ```
   */
  interval?: Interval;
}

/**
 * Derives new **x**, **x1**, and **x2** channels for each corresponding input
 * channel by quantizing to the given *interval*.
 */
export function quantizeX<T>(interval?: Interval, options?: T): Transformed<T>;
export function quantizeX<T>(options?: T & QuantizeOptions): Transformed<T>;

/**
 * Derives new **y**, **y1**, and **y2** channels for each corresponding input
 * channel by quantizing to the given *interval*.
 */
export function quantizeY<T>(interval?: Interval, options?: T): Transformed<T>;
export function quantizeY<T>(options?: T & QuantizeOptions): Transformed<T>;

/** Outputs for the quantize transform, and a corresponding *interval*. */
export type QuantizeOutputs = {[key in ChannelName]?: Interval};

/**
 * For each channel in the specified *outputs*, derives a new channel by
 * quantizing to the corresponding *interval*. For example, to quantize the
 * **stroke** channel:
 *
 * ```js
 * Plot.quantize({stroke: 10}, {x: "Date", stroke: "Close", stroke: "Volume"})
 * ```
 */
export function quantize<T>(outputs?: QuantizeOutputs, options?: T): Transformed<T>;

/**
 * Given an *interval*, returns a corresponding map implementation for use with
 * the map transform. See quantize.
 */
export function quantizeMap(interval: Interval): Map;
