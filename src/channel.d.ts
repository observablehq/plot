import type {Interval} from "./interval.js";
import type {Reducer} from "./reducer.js";
import type {ScaleName, ScaleType} from "./scales.js";

/** Lazily-constructed channel values derived from data. */
export interface ChannelTransform {
  /**
   * Given a mark’s (possibly transformed) data, returns the corresponding array
   * of values for the current channel. In rare cases, the given data or the
   * return value may be nullish.
   */
  transform: (data: any[]) => any[];

  /**
   * An optional human-readable label for this channel. The associated scale’s
   * axis (if any) label will default to this value, provided that all channels
   * that provide labels are consistent; the inferred axis label may also have a
   * percent sign and directional arrow as appropriate.
   */
  label?: string;
}

/**
 * The set of known channel names. Channels in custom marks may use other names;
 * these known names are enumerated for convenient autocomplete.
 */
export type ChannelName =
  | "ariaLabel"
  | "fill"
  | "fillOpacity"
  | "fontSize"
  | "fx"
  | "fy"
  | "geometry"
  | "height"
  | "href"
  | "length"
  | "opacity"
  | "path"
  | "r"
  | "rotate"
  | "src"
  | "stroke"
  | "strokeOpacity"
  | "strokeWidth"
  | "symbol"
  | "text"
  | "title"
  | "weight"
  | "width"
  | "x"
  | "x1"
  | "x2"
  | "y"
  | "y1"
  | "y2"
  | "z";

/**
 * An object literal of channel definitions. This is also used to represent
 * materialized channel states after mark initialization.
 */
export type Channels = {[key in ChannelName]?: Channel};

/**
 * A channel definition. This is also used to represent the materialized channel
 * state after mark initialization.
 */
export interface Channel {
  /**
   * The values for this channel. After initialization, this is either an array
   * of values or null. For channels that are not marked as optional, this value
   * must not be null.
   */
  value: ChannelValueSpec | null;

  /**
   * The name of this channel’s associated scale, if any. If a scale is
   * specified, this channel’s abstract values will be encoded using the
   * corresponding scale. If the scale is specified as true, the default scale
   * for this channel name will be used (such as the *color* scale for the
   * *fill* channel). The scale name *auto* is similar to true, except that the
   * scale will not be used if the associated values met certain criteria; for
   * example, a channel that would normally be associated with the *color* scale
   * will not if all values are valid CSS color strings. if the scale is
   * specified as false or null, the channel values will not be scaled.
   */
  scale?: ScaleName | "auto" | boolean | null;

  /**
   * The required scale type, if any. Marks may require a certain scale type;
   * for example, the barY mark requires that the *x* scale is a *band* scale.
   * If channels express a conflicting requirement for a given scale, an error
   * will be thrown during render.
   */
  type?: ScaleType;

  /** If true, values are optional for this channel. Defaults to false. */
  optional?: boolean;

  /**
   * How to filter this channel’s values. Values for which the filter does not
   * return truthy will be removed from the mark’s render index, preventing them
   * from being displayed. If not specified, uses the default filter which
   * returns true for any non-nullish, non-NaN value. If null, values will not
   * be filtered; all values will be rendered.
   */
  filter?: ((value: any) => boolean) | null;

  /**
   * An internal hint to affect the default construction of scales. For example,
   * the dot mark uses a channel hint to affect the default range of the
   * *symbol* scale and the default fill and stroke of the corresponding legend.
   */
  hint?: any;
}

/**
 * A channel’s values may be expressed as:
 *
 * - a function that returns the corresponding value for each datum
 * - a field name, to extract the corresponding value for each datum
 * - an iterable of values, typically of the same length as the data
 * - a channel transform that returns an iterable of values given the data
 * - a constant date, number, or boolean
 * - null to represent no value
 */
export type ChannelValue =
  | Iterable<any> // column of values
  | (string & Record<never, never>) // field or literal color; see also https://github.com/microsoft/TypeScript/issues/29729
  | Date // constant
  | number // constant
  | boolean // constant
  | null // constant
  | ((d: any, i: number) => any) // function of data
  | ChannelTransform; // function of data

/**
 * When specifying a mark channel’s value, you can provide a {value, scale}
 * object to override the scale that would normally be associated with the
 * channel.
 */
export type ChannelValueSpec = ChannelValue | {value: ChannelValue; scale?: Channel["scale"]}; // TODO label

/**
 * In some contexts, when specifying a mark channel’s value, you can provide a
 * {value, interval} object to specify an associated interval.
 */
export type ChannelValueIntervalSpec = ChannelValueSpec | {value: ChannelValue; interval?: Interval}; // TODO scale override?

/**
 * The available inputs for imputing scale domains. In addition to a named
 * channel, an input may be specified as:
 *
 * - *data* - impute from mark data
 * - *width* - impute from |*x2* - *x1*|
 * - *height* - impute from |*y2* - *y1*|
 * - null - impute from input order
 */
export type ChannelDomainValue = ChannelName | "data" | "width" | "height" | null;

/** Options for imputing scale domains from channel values. */
export interface ChannelDomainOptions {
  /**
   * How to produce a singular value (for subsequent sorting) from aggregated
   * channel values; one of:
   *
   * - true (default) - alias for *max*
   * - false or null - disabled; don’t impute the scale domain
   * - a named reducer implementation such as *count* or *sum*
   * - a function that takes an array of values and returns the reduced value
   * - an object that implements the *reduceIndex* method
   */
  reduce?: Reducer | boolean | null;

  /** If true, use descending instead of ascending order. */
  reverse?: boolean;

  /**
   * If a positive number, limit the domain to the first *n* sorted values; if a
   * negative number, limit the domain to the last *-n* sorted values. Otherwise
   * slices the sorted domain from *lo* (inclusive) to *hi* (exclusive); if
   * either *lo* or *hi* are negative, it indicates an offset from the end of
   * the array; if *lo* is undefined it defaults to 0, and if *hi* is undefined
   * it defaults to Infinity.
   */
  limit?: number | [lo?: number, hi?: number];
}

/** How to derive a scale’s domain from a channel’s values. */
export type ChannelDomainValueSpec = ChannelDomainValue | ({value: ChannelDomainValue} & ChannelDomainOptions);

/** How to impute scale domains from channel values. */
export type ChannelDomainSort = {[key in ScaleName]?: ChannelDomainValueSpec} & ChannelDomainOptions;

/**
 * Output channels for aggregating transforms, such as bin and group. Each
 * declared output channel has an associated reducer, and typically a
 * corresponding input channel in *options*. Non-grouping channels declared in
 * *options* but not *outputs* are computed on reduced data after grouping,
 * which defaults to the array of data for the current group.
 *
 * If **title** is in *options* but not *outputs*, the reducer defaults to
 * summarizing the most common values. If **href** is in *options* but not
 * *outputs*, the reducer defaults to *first*. When **x1** or **x2** is in
 * *outputs*, reads the input channel **x** if **x1** or **x2** is not in
 * *options*; likewise for **y1** or **y2**, reads the input channel **y** if
 * **y1** or **y2** is not in *options*.
 */
export type ChannelReducers<T = Reducer> = {[key in ChannelName]?: T | {reduce: T; scale?: Channel["scale"]} | null};

/** Abstract (unscaled) values, and associated scale, per channel. */
export type ChannelStates = {[key in ChannelName]?: {value: any[]; scale: ScaleName | null}};

/** Possibly-scaled values for each channel. */
export type ChannelValues = {[key in ChannelName]?: any[]} & {channels: ChannelStates};
