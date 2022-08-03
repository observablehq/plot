import type {
  Comparator,
  Dimensions,
  InitializerOption,
  InstantiatedMark,
  MarkOptions,
  Scales,
  ShuffleOptions,
  SortOption,
  TransformFunction,
  TransformOption
} from "../api.js";
import type {DataArray, Datum, index, Series, Value, ValueArray} from "../data.js";

import type {Accessor} from "../options.js";

import {randomLcg} from "d3";
import {ascendingDefined, descendingDefined} from "../defined.js";
import {arrayify, isDomainSort, isOptions, maybeValue, valueof} from "../options.js";

// If both t1 and t2 are defined, returns a composite transform that first
// applies t1 and then applies t2.
/**

#### Plot.transform(*options*, *transform*)

Given an *options* object that may specify some basic transforms (*filter*, *sort*, or *reverse*) or a custom *transform* function, composes those transforms if any with the given *transform* function, returning a new *options* object. If a custom *transform* function is present on the given *options*, any basic transforms are ignored. Any additional input *options* are passed through in the returned *options* object. This method facilitates applying the basic transforms prior to applying the given custom *transform* and is used internally by Plot’s built-in transforms.

@link https://github.com/observablehq/plot/blob/main/README.md#plottransformoptions-transform

 */
export function basic<T extends Datum, U extends Value>(
  {filter: f1, sort: s1, reverse: r1, transform: t1, initializer: i1, ...options}: MarkOptions<T, U> = {},
  t2: TransformOption<T, U>
): MarkOptions<T, U> {
  if (t1 === undefined) {
    // explicit transform overrides filter, sort, and reverse
    if (f1 != null) t1 = filterTransform<T, U>(f1);
    if (s1 != null && !isDomainSort(s1)) t1 = composeTransform<T, U>(t1, sortTransform<T, U>(s1) as TransformOption<T, U>);
    if (r1) t1 = composeTransform<T, U>(t1, reverseTransform);
  }
  if (t2 != null && i1 != null) throw new Error("transforms cannot be applied after initializers");

  return {
    ...options,
    ...((s1 === null || isDomainSort(s1)) && {sort: s1}),
    transform: composeTransform<T, U>(t1, t2)
  };
}

// If both i1 and i2 are defined, returns a composite initializer that first
// applies i1 and then applies i2.
export function initializer<T extends Datum, U extends Value>(
  {filter: f1, sort: s1, reverse: r1, initializer: i1, ...options}: MarkOptions<T, U> = {},
  i2: InitializerOption<T, U>
): MarkOptions<T, U> {
  if (i1 === undefined) {
    // explicit initializer overrides filter, sort, and reverse
    if (f1 != null) i1 = filterTransform(f1);
    if (s1 != null && !isDomainSort(s1)) i1 = composeInitializer<T, U>(i1, sortTransform<T, U>(s1) as TransformOption<T, U>);
    if (r1) i1 = composeInitializer<T, U>(i1, reverseTransform);
  }
  return {
    ...options,
    initializer: composeInitializer<T, U>(i1, i2)
  };
}

function composeTransform<T extends Datum, U extends Value>(t1: TransformOption<T, U>, t2: TransformOption<T, U>): TransformOption<T, U> {
  if (t1 == null) return t2 === null ? undefined : t2;
  if (t2 == null) return t1 === null ? undefined : t1;
  return function (this: InstantiatedMark<T, U>, data: DataArray<T>, facets: Series[]) {
    ({data, facets} = t1.call(this, data, facets));
    return t2.call(this, arrayify(data), facets); // I believe this arrayify to be useless
  };
}

function composeInitializer<T extends Datum, U extends Value>(i1: InitializerOption<T, U>, i2: InitializerOption<T, U>): InitializerOption<T, U> {
  if (i1 == null) return i2 === null ? undefined : i2;
  if (i2 == null) return i1 === null ? undefined : i1;
  return function (data, facets, channels, scales: Scales, dimensions?: Dimensions) {
    let c1, d1, f1, c2, d2, f2;
    // eslint-disable-next-line prefer-const
    ({data: d1 = data, facets: f1 = facets, channels: c1} = i1.call(this, data, facets, channels, scales, dimensions));
    // eslint-disable-next-line prefer-const
    ({data: d2 = d1, facets: f2 = f1, channels: c2} = i2.call(this, d1, f1, {...channels, ...c1}, scales, dimensions));
    return {data: d2, facets: f2, channels: {...c1, ...c2}};
  };
}

function apply<T extends Datum, U extends Value>(options: MarkOptions<T, U>, t: TransformOption<T, U> | InitializerOption<T, U>): MarkOptions<T, U> {
  return options.initializer != null ? initializer(options, t) : basic(options, t as TransformOption<T, U>);
}

/**
 * Plot.filter(test, options)
 *
 * Filters the data given the specified _test_. The test can be given as an accessor function
 * (which receives the _datum_ and _index_), or as a channel value definition such as a field
 * name; truthy values are retained.
 */
export function filter<T extends Datum, U extends Value>(value: Accessor<T, U>, options: MarkOptions<T, U>) {
  return apply(options, filterTransform(value));
}

function filterTransform<T extends Datum, U extends Value>(value: Accessor<T, U>): TransformFunction<T, U> {
  return (data: DataArray<T>, facets: Series[]) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const V = valueof(data, value)!;
    return {data, facets: facets.map((I) => I.filter((i) => V[i]))};
  };
}

export function reverse<T extends Datum, U extends Value>(options: MarkOptions<T, U>): MarkOptions<T, U> {
  return {...apply<T, U>(options, reverseTransform), sort: null};
}

function reverseTransform<T extends Datum>(data: DataArray<T>, facets: Series[]) {
  return {data, facets: facets.map((I) => I.slice().reverse())};
}

/**
 * Shuffles the data randomly. If a *seed* option is specified, a linear congruential
 * generator with the given seed is used to generate random numbers deterministically;
 * otherwise, Math.random is used.
 * @link https://github.com/observablehq/plot/blob/main/README.md#plotshuffleoptions
 */
export function shuffle<T extends Datum, U extends Value>({seed, ...options}: ShuffleOptions & MarkOptions<T, U> = {}): MarkOptions<T, U> {
  return {
    ...apply(options, sortValue(seed == null ? Math.random : randomLcg(seed)) as TransformOption<T, U>),
    sort: null
  };
}

export function sort<T extends Datum, U extends Value>(value: SortOption, options: MarkOptions<T, U>) {
  return {
    ...(isOptions(value) && value.channel !== undefined
      ? initializer(options, sortTransform<T, U>(value) as InitializerOption<T, U>)
      : apply(options, sortTransform<T, U>(value) as TransformOption<T, U>)),
    sort: null
  };
}

// eslint-disable-next-line @typescript-eslint/ban-types
function sortTransform<T extends Datum, U extends Value>(value: SortOption): TransformOption<T, U> | {} {
  return typeof value === "function" && value.length !== 1 ? sortData(value as Comparator) : sortValue(value);
}

function sortData<T extends Datum, U extends Value>(compare: Comparator): TransformOption<T, U> {
  return (data: DataArray<T>, facets: Series[]) => {
    const compareData = (i: index, j: index) => compare(data[i], data[j]);
    return {data, facets: facets.map((I) => I.slice().sort(compareData))};
  };
}

type ValueChannels = "x" | "y" | "r";
type InstantiatedChannel = {value: ValueArray};
type InstantiatedChannels = Record<ValueChannels, InstantiatedChannel>;

// eslint-disable-next-line @typescript-eslint/ban-types
function sortValue<T extends Datum, U extends Value>(v: SortOption): TransformOption<T, U> | InitializerOption<T, U> | {} {
  let {
    channel, // eslint-disable-line prefer-const
    value, // eslint-disable-line prefer-const
    order = ascendingDefined
  } = maybeValue(v);
  if (typeof order !== "function") {
    switch (`${order}`.toLowerCase()) {
      case "ascending":
        order = ascendingDefined as Comparator;
        break;
      case "descending":
        order = descendingDefined as Comparator;
        break;
      default:
        throw new Error(`invalid order: ${order}`);
    }
  }
  return (data: DataArray<T>, facets: Series[], channels?: InstantiatedChannels) => {
    let V: ValueArray;
    if (channel === undefined) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      V = valueof(data, value)!;
    } else {
      if (channels === undefined) throw new Error("channel sort requires an initializer");
      const V0 = channels[channel as ValueChannels]; // TODO
      if (!V0) return {}; // ignore missing channel
      V = V0.value;
    }
    const compareValue = (i: index, j: index) => (order as Comparator)(V[i], V[j]);
    return {data, facets: facets.map((I) => I.slice().sort(compareValue))};
  };
}
