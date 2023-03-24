import type {ChannelName, ChannelValue} from "../channel.js";
import type {Transformed} from "./basic.js";

/** A shorthand functional map implementation (from source S to target T).  */
export type MapFunction<S = any, T = S> = (values: S[]) => T[];

/** The built-in map implementations. */
export type MapName = "cumsum" | "rank" | "quantile";

/** A map implementation (from source S to target T). */
export interface MapImplementation<S = any, T = S> {
  /**
   * This method is repeatedly passed the index for each series (an array of
   * integers), the corresponding input channel’s array of values, and the
   * output channel’s array of values; it must populate the slots specified by
   * the index in the output array.
   */
  mapIndex(index: number[], source: S[], target: T[]): void;
}

/** How to produce new channel values for each series. */
export type Map = MapImplementation | MapFunction | MapName;

/** Outputs for the map transform. */
export type MapOutputs = {[key in ChannelName]?: Map};

/** Options for the map transform. */
export interface MapOptions {
  /**
   * How to group data into series. If not specified, series will be determined
   * by the *fill* channel, if any, or the *stroke* channel, if any.
   */
  z?: ChannelValue;
}

/**
 * Groups on the first channel of *z*, *fill*, or *stroke*, if any, and then
 * applies the specified *map* method to each of the *x*, *x1*, and *x2*
 * channels declared in the *options*. The *map* may be specified as:
 *
 * * *cumsum* - a cumulative sum
 * * *rank* - the rank of each value in the sorted array
 * * *quantile* - the rank, normalized between 0 and 1
 * * a function to be passed an array of values, returning new values
 * * an object that implements the *mapIndex* method
 *
 * If a function is used, it must return an array of the same length as the
 * given input. If a *mapIndex* method is used, it is repeatedly passed the
 * index for each series (an array of integers), the corresponding input
 * channel’s array of values, and the output channel’s array of values; it must
 * populate the slots specified by the index in the output array.
 */
export function mapX<T>(map: Map, options?: T & MapOptions): Transformed<T>;

/**
 * Groups on the first channel of *z*, *fill*, or *stroke*, if any, and then
 * applies the specified map method to each of the *y*, *y1*, and *y2* channels
 * declared in the *options*. The *map* may be specified as:
 *
 * * *cumsum* - a cumulative sum
 * * *rank* - the rank of each value in the sorted array
 * * *quantile* - the rank, normalized between 0 and 1
 * * a function to be passed an array of values, returning new values
 * * an object that implements the *mapIndex* method
 *
 * If a function is used, it must return an array of the same length as the
 * given input. If a *mapIndex* method is used, it is repeatedly passed the
 * index for each series (an array of integers), the corresponding input
 * channel’s array of values, and the output channel’s array of values; it must
 * populate the slots specified by the index in the output array.
 */
export function mapY<T>(map: Map, options?: T & MapOptions): Transformed<T>;

/**
 * Groups on the first channel of *z*, *fill*, or *stroke*, if any, and then for
 * each channel declared in the specified *outputs*, applies the corresponding
 * *map* method. Each channel in *outputs* must have a corresponding input
 * channel in *options*.
 *
 * ```js
 * Plot.map({y: "cumsum"}, {y: d3.randomNormal()})
 * ```
 *
 * Each *map* in *outputs* may be specified as:
 *
 * * *cumsum* - a cumulative sum
 * * *rank* - the rank of each value in the sorted array
 * * *quantile* - the rank, normalized between 0 and 1
 * * a function to be passed an array of values, returning new values
 * * an object that implements the *mapIndex* method
 *
 * If a function is used, it must return an array of the same length as the
 * given input. If a *mapIndex* method is used, it is repeatedly passed the
 * index for each series (an array of integers), the corresponding input
 * channel’s array of values, and the output channel’s array of values; it must
 * populate the slots specified by the index in the output array.
 */
export function map<T>(outputs?: MapOutputs, options?: T & MapOptions): Transformed<T>;
