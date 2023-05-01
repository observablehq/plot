import type {PlotOptions} from "../plot.js";
import type {ChannelName, Channels, ChannelValue} from "../channel.js";
import type {Context} from "../context.js";
import type {Dimensions} from "../dimensions.js";
import type {ScaleFunctions} from "../scales.js";

/**
 * A mark transform function is passed the mark’s *data*, a nested index into
 * the data, *facets*, and the plot’s *options*. The transform function returns
 * new mark data and facets; the returned **data** defaults to the passed
 * *data*, and the returned **facets** defaults to the passed *facets*. The mark
 * is the *this* context. Transform functions can also trigger side-effects, say
 * to populate lazily-derived columns; see also Plot.column.
 */
export type TransformFunction = (
  data: any[],
  facets: number[][],
  options?: PlotOptions
) => {data?: any[]; facets?: number[][]};

/**
 * A mark initializer function is passed the mark’s (possibly transformed)
 * *data*, a nested index into the data, *facets*, and the mark’s initialized
 * *channels*, along with the plot’s *scales*, *dimensions*, and *context*. The
 * initializer function returns new mark data, facets, and channels; the
 * returned **data** defaults to the passed *data*, the returned **facets**
 * defaults to the passed *facets*, and the returned **channels** are merged
 * with the passed channels, replacing channels of the same name. The mark
 * itself is the *this* context.
 *
 * Whereas a mark transform operates in abstract data space on channel values
 * prior to scale application, a mark initializer runs after the (initial)
 * scales are constructed and hence can operate in screen space, such as pixel
 * coordinates and colors. For example, an initializer can adjust a mark’s
 * positions to avoid occlusion.
 *
 * If any of the returned derived channels are bound to scales, the associated
 * scales will be re-initialized. To avoid a circular dependency, mark
 * initializer functions cannot re-initialize position scales (*x*, *y*, *fx*,
 * and *fy*). If an initializer desires a channel not supported by the
 * downstream mark, additional channels can be declared using the mark
 * **channels** option.
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

/**
 * Compares the two values *a* and *b*, returning a negative number if *a* is
 * considered less than *b*, a positive number if *a* is considered greater than
 * *b*, or zero if *a* and *b* are considered equal.
 */
export type CompareFunction = (a: any, b: any) => number;

/** Mark options with a mark transform. */
export type Transformed<T> = T & {transform: TransformFunction};

/** Mark options with a mark initializer. */
export type Initialized<T> = T & {initializer: InitializerFunction};

/**
 * Given an *options* object that may specify some basic transforms (**filter**,
 * **sort**, or **reverse**) or a custom **transform**, composes those
 * transforms with the given *transform* function, returning a new *options*
 * object.
 *
 * If a custom **transform** is present on the given *options*, any basic
 * transforms are ignored. Any additional input *options* are passed through in
 * the returned *options* object. This method facilitates applying basic
 * transforms prior to applying the given *transform* and is used internally by
 * Plot’s built-in transforms.
 *
 * The given *transform* runs after the existing transforms in *options*. Throws
 * an error if the given *options* define an **initializer**, since mark
 * transforms must run before mark initializers.
 */
export function transform<T>(options: T, transform: TransformFunction): Transformed<T>;

/**
 * Given an *options* object that may specify some basic initializers
 * (**filter**, **sort**, or **reverse**) or a custom **initializer**, composes
 * those initializers with the given *initializer* function, returning a new
 * *options* object.
 *
 * If a custom **initializer** is present on the given *options*, any basic
 * initializers are ignored. Any additional input *options* are passed through
 * in the returned *options* object. This method facilitates applying basic
 * initializers prior to applying the given *initializer* and is used internally
 * by Plot’s built-in initializers.
 *
 * If the given *initializer* does not need to operate in screen space (after
 * scale application), it should instead be implemented as a mark transform for
 * simplicity; see Plot.transform.
 */
export function initializer<T>(options: T, initializer: InitializerFunction): Initialized<T>;

/**
 * Applies a transform to *options* to filter the mark’s index according to the
 * given *test*, which can be a function (receiving the datum *d* and index *i*)
 * or a channel value definition such as a field name; only truthy values are
 * retained in the index. For example, to show only data whose body mass is
 * greater than 3,000g:
 *
 * ```js
 * Plot.filter((d) => d.body_mass_g > 3000, options)
 * ```
 *
 * Note that filtering only affects the rendered mark index, not the associated
 * channel values, and thus has no effect on imputed scale domains.
 */
export function filter<T>(test: ChannelValue, options?: T): Transformed<T>;

/**
 * Applies a transform to *options* to reverse the order of the mark’s index,
 * say for reverse input order.
 */
export function reverse<T>(options?: T): Transformed<T>;

/**
 * Applies a transform to *options* to randomly shuffles the mark’s index. If a
 * **seed** is specified, a linear congruential generator with the given seed is
 * used to generate random numbers deterministically; otherwise, Math.random is
 * used.
 */
export function shuffle<T>(options?: T & {seed?: number}): Transformed<T>;

/**
 * How to order values; one of:
 *
 * - a function for comparing data, returning a signed number
 * - a channel value definition for sorting given values in ascending order
 * - a {value, order} object for sorting given values
 * - a {channel, order} object for sorting the named channel’s values
 */
export type SortOrder =
  | CompareFunction
  | ChannelValue
  | {value?: ChannelValue; order?: CompareFunction | "ascending" | "descending"}
  | {channel?: ChannelName; order?: CompareFunction | "ascending" | "descending"};

/**
 * Applies a transform to *options* to sort the mark’s index by the specified
 * *order*. The *order* is one of:
 *
 * - a function for comparing data, returning a signed number
 * - a channel value definition for sorting given values in ascending order
 * - a {value, order} object for sorting given values
 * - a {channel, order} object for sorting the named channel’s values
 *
 * For example, to render marks in order of ascending body mass:
 *
 * ```js
 * Plot.sort("body_mass_g", options)
 * ```
 */
export function sort<T>(order: SortOrder, options?: T): Transformed<T>;
