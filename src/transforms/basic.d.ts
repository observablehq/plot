import type {ChannelName, Channels, ChannelValue} from "../channel.js";
import type {Context} from "../context.js";
import type {Dimensions} from "../dimensions.js";
import type {ScaleFunctions} from "../scales.js";

/**
 * A data transform receives the data and an array of facets (indices into the
 * data), and returns possibly new data and facets. Can be used in conjunction
 * with Plot.**column** to affect channels.
 */
export type TransformFunction = (data: any[], facets: number[][]) => {data?: any[]; facets?: number[][]};

/**
 * Initializers can be used to transform and derive new channels prior to
 * rendering. Unlike transforms which operate in abstract data space,
 * initializers can operate in screen space such as pixel coordinates and
 * colors. For example, initializers can modify a marks’ positions to avoid
 * occlusion. Initializers are invoked *after* the initial scales are
 * constructed and can modify the channels or derive new channels; these in turn
 * may (or may not, as desired) be passed to scales.
 */
export type InitializerFunction = (
  data: any[],
  facets: number[][],
  channels: Channels,
  scales: ScaleFunctions,
  dimensions: Dimensions,
  context: Context
) => {
  data?: any[];
  facets?: number[][];
  channels?: Channels;
};

export type CompareFunction = (a: any, b: any) => number;

export type Transformed<T> = T & {transform: TransformFunction};

export type Initialized<T> = T & {initializer: InitializerFunction};

/**
 * Given an *options* object that may specify some basic transforms (*filter*,
 * *sort*, or *reverse*) or a custom *transform* function, composes those
 * transforms if any with the given *transform* function, returning a new
 * *options* object. If a custom *transform* function is present on the given
 * *options*, any basic transforms are ignored. Any additional input *options*
 * are passed through in the returned *options* object. This method facilitates
 * applying the basic transforms prior to applying the given custom *transform*
 * and is used internally by Plot’s built-in transforms.
 */
export function transform<T>(options: T, transform: TransformFunction): Transformed<T>;

/**
 * This helper composes the *initializer* function with any other transforms
 * present in the *options*, and returns a new *options* object. The initializer
 * function is called after the scales have been computed, and receives as
 * inputs the (possibly transformed) array of *data*, the *facets* index of
 * elements of this array that belong to each facet, the input *channels* (as an
 * object of named channels), the *scales*, and the *dimensions*. The mark
 * itself is the *this* context. The initializer function must return an object
 * with *data*, *facets*, and new *channels*. Any new channels are merged with
 * existing channels, replacing channels of the same name. If an initializer
 * desires a channel that is not supported by the downstream mark, additional
 * channels can be declared using the mark **channels** option.
 */
export function initializer<T>(options: T, initializer: InitializerFunction): Initialized<T>;

/**
 * Filters the data given the specified *test*. The test can be given as an
 * accessor function (which receives the datum and index), or as a channel value
 * definition such as a field name; truthy values are retained.
 *
 * ```js
 * Plot.filter(d => d.body_mass_g > 3000, options) // show data whose body mass is greater than 3kg
 * ```
 */
export function filter<T>(test: ChannelValue, options?: T): Transformed<T>;

/**
 * Reverses the order of the data. Often used in conjunction with Plot.**sort**.
 */
export function reverse<T>(options?: T): Transformed<T>;

/**
 * Shuffles the data randomly. If a *seed* option is specified, a linear
 * congruential generator with the given seed is used to generate random numbers
 * deterministically; otherwise, Math.random is used.
 */
export function shuffle<T>(options?: T): Transformed<T>;

export interface SortOrderOptions {
  channel?: ChannelName;
  value?: ChannelValue;
  order?: CompareFunction | "ascending" | "descending";
}

export type SortOrder = CompareFunction | ChannelValue | SortOrderOptions;

/**
 * Sorts the data by the specified *order*, which can be an accessor function, a
 * comparator function, or a channel value definition such as a field name.
 *
 * ```js
 * Plot.sort("body_mass_g", options) // show data in ascending body mass order
 * ```
 */
export function sort<T>(order: SortOrder, options?: T): Transformed<T>;
