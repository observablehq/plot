import type {ChannelName, ChannelValue} from "../channel.js";
import type {Transformed} from "./basic.js";

/**
 * A shorthand functional map implementation: given an array of input channel
 * *values*, returns the corresponding array of mapped output channel values.
 * The returned array must have the same length as the given input.
 */
export type MapFunction<S = any, T = S> = (values: S[]) => T[];

/**
 * The built-in map implementations; one of:
 *
 * - *cumsum* - a cumulative sum
 * - *rank* - the rank of each value in the sorted array
 * - *quantile* - the rank, normalized between 0 and 1
 */
export type MapName = "cumsum" | "rank" | "quantile";

/** A map implementation. */
export interface MapImplementation<S = any, T = S> {
  /**
   * Given an *index* representing the contents of the current series, the input
   * channel’s array of *source* values, and the output channel’s array of
   * *target* values, populates the slots in *target* specified by *index* with
   * the desired mapped output values.
   */
  mapIndex(index: number[], source: S[], target: T[]): void;
}

/**
 * How to produce new channel values for each series; one of:
 *
 * - a named map implementation such as *cumsum* or *rank*
 * - a function to be passed an array of values, returning new values
 * - an object that implements the *mapIndex* method
 */
export type Map = MapImplementation | MapFunction | MapName;

/**
 * Outputs for the map transform. Each declared output channel must have a
 * corresponding input channel in *options*.
 *
 * When **x1** or **x2** is in *outputs*, reads the input channel **x** if
 * **x1** or **x2** is not in *options*; likewise for **y1** or **y2**, reads
 * the input channel **y** if **y1** or **y2** is not in *options*.
 */
export type MapOutputs = {[key in ChannelName]?: Map};

/** Options for the map transform. */
export interface MapOptions {
  /**
   * How to group data into series. If not specified, series will be determined
   * by the **fill** channel, if any, or the **stroke** channel, if any.
   */
  z?: ChannelValue;
}

/**
 * Groups on the first channel of **z**, **fill**, or **stroke**, if any, and
 * then applies the specified *map* method to each of the **x**, **x1**, and
 * **x2** channels in the specified *options* to produce new channel values for
 * each series. The *map* method may be one of:
 *
 * - a named map implementation such as *cumsum* or *rank*
 * - a function to be passed an array of values, returning new values
 * - an object that implements the *mapIndex* method
 *
 * For example, to produce a cumulative sum of random numbers on the **x**
 * channel:
 *
 * ```js
 * Plot.mapX("cumsum", {x: d3.randomNormal()})
 * ```
 */
export function mapX<T>(map: Map, options?: T & MapOptions): Transformed<T>;

/**
 * Groups on the first channel of **z**, **fill**, or **stroke**, if any, and
 * then applies the specified map method to each of the **y**, **y1**, and
 * **y2** channels in the specified *options* to produce new channel values for
 * each series. The *map* method may be one of:
 *
 * - a named map implementation such as *cumsum* or *rank*
 * - a function to be passed an array of values, returning new values
 * - an object that implements the *mapIndex* method
 *
 * For example, to produce a cumulative sum of random numbers on the **y**
 * channel:
 *
 * ```js
 * Plot.mapY("cumsum", {y: d3.randomNormal()})
 * ```
 */
export function mapY<T>(map: Map, options?: T & MapOptions): Transformed<T>;

/**
 * Groups on the first channel of **z**, **fill**, or **stroke**, if any, and
 * then for each channel in the specified *outputs*, applies the corresponding
 * *map* method to produce new channel values for each series. Each *map* method
 * may be one of:
 *
 * - a named map implementation such as *cumsum* or *rank*
 * - a function to be passed an array of values, returning new values
 * - an object that implements the *mapIndex* method
 *
 * For example, to produce a cumulative sum of random numbers on the **y**
 * channel:
 *
 * ```js
 * Plot.map({y: "cumsum"}, {y: d3.randomNormal()})
 * ```
 */
export function map<T>(outputs?: MapOutputs, options?: T & MapOptions): Transformed<T>;
