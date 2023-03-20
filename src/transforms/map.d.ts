import type {ChannelName, ChannelValue} from "../channel.js";
import type {Transformed} from "./basic.js";

export type MapFunction<S, T = S> = (values: S[]) => T[];

export type MapName = "cumsum" | "rank" | "quantile";

export interface MapImplementation<S, T = S> {
  mapIndex(index: number[], source: S[], target: T[]): void;
}

export type Map = MapImplementation<any> | MapFunction<any> | MapName;

export interface MapOptions {
  z?: ChannelValue;
}

/**
 * Groups on the first channel of *z*, *fill*, or *stroke*, if any, and then
 * applies the specified map method to each of the *x*, *x1*, and *x2* channels
 * declared in the *options*.
 *
 * The following map methods are supported:
 *
 * * *cumsum* - a cumulative sum
 * * *rank* - the rank of each value in the sorted array
 * * *quantile* - the rank, normalized between 0 and 1
 * * a function to be passed an array of values, returning new values
 * * an object that implements the *map* method
 *
 * If a function is used, it must return an array of the same length as the
 * given input. If a *map* method is used, it is repeatedly passed the index for
 * each series (an array of integers), the corresponding input channel’s array
 * of values, and the output channel’s array of values; it must populate the
 * slots specified by the index in the output array.
 */
export function mapX<T>(map: Map, options?: T & MapOptions): Transformed<T>;

/**
 * Groups on the first channel of *z*, *fill*, or *stroke*, if any, and then
 * applies the specified map method to each of the *y*, *y1*, and *y2* channels
 * declared in the *options*.
 *
 * The following map methods are supported:
 *
 * * *cumsum* - a cumulative sum
 * * *rank* - the rank of each value in the sorted array
 * * *quantile* - the rank, normalized between 0 and 1
 * * a function to be passed an array of values, returning new values
 * * an object that implements the *map* method
 *
 * If a function is used, it must return an array of the same length as the
 * given input. If a *map* method is used, it is repeatedly passed the index for
 * each series (an array of integers), the corresponding input channel’s array
 * of values, and the output channel’s array of values; it must populate the
 * slots specified by the index in the output array.
 */
export function mapY<T>(map: Map, options?: T & MapOptions): Transformed<T>;

/**
 * Groups on the first channel of *z*, *fill*, or *stroke*, if any, and then for
 * each channel declared in the specified *outputs* object, applies the
 * corresponding map method. Each channel in *outputs* must have a corresponding
 * input channel in *options*.
 *
 * ```js
 * Plot.map({y: "cumsum"}, {y: d3.randomNormal()})
 * ```
 *
 * The following map methods are supported:
 *
 * * *cumsum* - a cumulative sum
 * * *rank* - the rank of each value in the sorted array
 * * *quantile* - the rank, normalized between 0 and 1
 * * a function to be passed an array of values, returning new values
 * * an object that implements the *map* method
 *
 * If a function is used, it must return an array of the same length as the
 * given input. If a *map* method is used, it is repeatedly passed the index for
 * each series (an array of integers), the corresponding input channel’s array
 * of values, and the output channel’s array of values; it must populate the
 * slots specified by the index in the output array.
 */
export function map<T>(outputs?: {[key in ChannelName]?: Map}, options?: T & MapOptions): Transformed<T>;
