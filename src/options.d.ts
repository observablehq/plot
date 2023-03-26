import type {ChannelTransform, ChannelValue} from "./channel.js";
import type {Data} from "./mark.js";

/** Something like Array, Float32Array, etc. */
type ArrayishConstructor = (new (...args: any) => any) & {from: (data: Data) => Iterable<any> & ArrayLike<any>};

/**
 * Given some *data* and a channel *value* definition (such as a field name or
 * function accessor), returns an array (a column) of the specified *type* with
 * the corresponding value of each element of the data.
 *
 * If *type* is specified, it must be Array or a similar class that implements
 * the [Array.from][1] interface such as a typed array.
 *
 * Plot.valueof is not guaranteed to return a new array. When a transform method
 * is used, or when the given *value* is an array that is compatible with the
 * requested *type*, the array may be returned as-is without making a copy.
 *
 * [1]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from
 */
export function valueof(data: Data | null, value: ChannelValue | null, type?: ArrayConstructor): any[] | null;
export function valueof<T extends ArrayishConstructor>(data: Data | null, value: ChannelValue | null, type: T): InstanceType<T> | null; // prettier-ignore

/**
 * This helper for constructing derived columns returns a [*column*,
 * *setColumn*] array. The *column* object implements *column*.transform,
 * returning whatever value was most recently passed to *setColumn*. If
 * *setColumn* is not called, then *column*.transform returns undefined. If a
 * *source* is specified, then *column*.label exposes the given *source*’s
 * label, if any: if *source* is a string as when representing a named field of
 * data, then *column*.label is *source*; otherwise *column*.label propagates
 * *source*.label. This allows derived columns to propagate a human-readable
 * axis or legend label.
 *
 * Plot.column is typically used by options transforms to define new channels;
 * the associated columns are populated (derived) when the **transform** option
 * function is invoked. See Plot.**transform**.
 */
export function column(source?: any): [ChannelTransform, <T>(value: T) => T];

/**
 * This helper returns a source array as-is, avoiding an extra copy when
 * defining a channel as being equal to the data:
 *
 * ```js
 * Plot.raster(await readValues(), {width: 300, height: 200, fill: Plot.identity})
 * ```
 */
export const identity: ChannelTransform;
