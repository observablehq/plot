/* eslint-disable @typescript-eslint/no-explicit-any */
import type {Data, DataArray, Datum, Series, Value, ValueArray} from "./data.js";
import type {Accessor, GetColumn, pXX, ColorAccessor} from "./options.js";
/**
 * Plot API
 * @link https://github.com/observablehq/plot/blob/main/README.md
 */

/**
 * API Types
 */
type pixels = number;

/**
 * The data is then arrayified, and a range of indices is computed, serving as pointers
 * into a the column representation of Plot.valueof
 */

/**
 * Layout options (in pixels)
 */
type LayoutOptions = {
  marginTop?: pixels; // the top margin
  marginRight?: pixels; // the right margin
  marginBottom?: pixels; // the bottom margin
  marginLeft?: pixels; // the left margin
  margin?: pixels; // shorthand for the four margins
  width?: pixels; // the outer width of the plot (including margins)
  height?: pixels; // the outer height of the plot (including margins)
};

/**
 * Facet options
 */
type FacetOptions<T extends Datum> = {
  facet?: {
    data: Data<T>;
    x?: Accessor<T>;
    y?: Accessor<T>;
    marginTop?: pixels; // the top margin
    marginRight?: pixels; // the right margin
    marginBottom?: pixels; // the bottom margin
    marginLeft?: pixels; // the left margin
    margin?: pixels; // shorthand for the four margins
    grid?: boolean; // if true, draw grid lines for each facet
    label?: null; // if null, disable default facet axis labels
  };
};

/**
 * Style options
 */
type PlotStyleOptions = {
  style?: string | Partial<CSSStyleDeclaration>;
};

/**
 * Scale options
 */
type ScaleOptions = any; // TODO
type ScalesOptions = {
  x?: ScaleOptions;
  y?: ScaleOptions;
  r?: ScaleOptions;
  color?: ScaleOptions;
  opacity?: ScaleOptions;
  length?: ScaleOptions;
  symbol?: ScaleOptions;
  fx?: ScaleOptions;
  fy?: ScaleOptions;
  inset?: pixels;
  grid?: boolean; // shorthand for x.grid and y.grid
};

/**
 * An instantiated mark
 */
export type InstantiatedMark<T extends Datum> = {
  initialize: (data: Data<T>) => void;
  z?: Accessor<T>; // copy the user option for error messages
  clip?: "frame";
  dx: number;
  dy: number;
  marker?: MaybeMarkerFunction;
  markerStart?: MaybeMarkerFunction;
  markerMid?: MaybeMarkerFunction;
  markerEnd?: MaybeMarkerFunction;

  // common styles, as constants
  stroke?: string | null;
  fill?: string | null;
  fillOpacity?: number | null;
  strokeWidth?: number | null;
  strokeOpacity?: number | null;
  strokeLinejoin?: string | null;
  strokeLinecap?: string | null;
  strokeMiterlimit?: number | null;
  strokeDasharray?: string | null;
  strokeDashoffset?: string | null;
  target?: string | null;
  ariaLabel?: string | null;
  ariaDescription?: string | null;
  ariaHidden?: "true" | "false";
  opacity?: number | null;
  mixBlendMode?: string | null;
  paintOrder?: string | null;
  pointerEvents?: string | null;
  shapeRendering?: string | null;

  // other styles, some of which are not supported by all marks
  frameAnchor?: string;

  // other properties
  sort?: SortOption | null;
};

/**
 * A mark
 */
type Mark<T extends Datum> = InstantiatedMark<T> | (() => SVGElement | null | undefined) | Mark<T>[];
type MarksOptions<T extends Datum> = {marks?: Mark<T>[]};

/**
 * Other top-level options
 */
type TopLevelOptions = {
  ariaLabel?: string | null;
  ariaDescription?: string | null;
  caption?: string | HTMLElement; // a caption
  className?: string;
  document?: Document; // the document used to create plot elements
};

/**
 * Plot options
 */
export type PlotOptions<T extends Datum> = LayoutOptions &
  FacetOptions<T> &
  MarksOptions<T> &
  PlotStyleOptions &
  ScalesOptions &
  TopLevelOptions;

/**
 * Legend options
 */
type LegendOptions = any; // TODO

/**
 * Plot returns a SVG or a FIGURE element, with additional properties
 */
export interface Chart extends HTMLElement {
  scale: (
    scaleName: "x" | "y" | "r" | "color" | "opacity" | "length" | "symbol" | "fx" | "fy"
  ) => ScaleOptions | undefined;
  legend: (scaleName: "color" | "opacity" | "symbol", legendOptions: LegendOptions) => HTMLElement | undefined;
}

export type MaybeSymbol<T extends Datum> = Accessor<T> | SymbolName | SymbolObject | null | undefined;

/**
 * Mark channel options
 */
export type CommonChannelOptions<T extends Datum> = {
  x?: Accessor<T> | number; // TODO: OptionsX
  x1?: Accessor<T> | number;
  x2?: Accessor<T> | number;
  y?: Accessor<T> | number; // TODO: OptionsY
  y1?: Accessor<T> | number;
  y2?: Accessor<T> | number;
  z?: Accessor<T>;
  fill?: ColorAccessor<T> | null;
  fillOpacity?: Accessor<T> | number | null;
  r?: Accessor<T>; // TODO: OptionsR
  stroke?: ColorAccessor<T> | null;
  strokeOpacity?: Accessor<T> | number | null;
  strokeWidth?: Accessor<T> | number | null;
  symbol?: MaybeSymbol<T>;
  opacity?: Accessor<T> | number | null;
};

/**
 * Mark constant style options
 */
export type ConstantStyleOptions = {
  ariaDescription?: string;
  ariaHidden?: boolean;
  target?: string;
  strokeLinecap?: string;
  strokeLinejoin?: string;
  strokeMiterlimit?: pixels;
  strokeDasharray?: pixels | string | pixels[];
  strokeDashoffset?: string;
  mixBlendMode?: string;
  paintOrder?: string;
  pointerEvents?: string;
  shapeRendering?: string;
};

/**
 * Default options for marks, strings or numbers
 */
export type DefaultOptions = {
  ariaLabel?: string;
  fill?: string;
  fillOpacity?: number;
  stroke?: string;
  strokeOpacity?: number;
  strokeWidth?: pixels;
  strokeLinecap?: string;
  strokeLinejoin?: string;
  strokeMiterlimit?: pixels;
  paintOrder?: string;
};

/**
 * Channel styles
 */
export type ChannelStyles = {
  ariaLabel?: ValueArray;
  title?: ValueArray;
  fill?: ValueArray;
  fillOpacity?: ValueArray;
  stroke?: ValueArray;
  strokeOpacity?: ValueArray;
  strokeWidth?: ValueArray;
  opacity?: ValueArray;
  href: ValueArray;
  z?: ValueArray;
};

/**
 * Inset options for marks
 */
type InsetOptions = {
  inset?: pixels;
  insetLeft?: pixels;
  insetRight?: pixels;
  insetTop?: pixels;
  insetBottom?: pixels;
};

/**
 * Interval options
 * 
If the interval option is specified, the binX transform is implicitly applied to the specified options. The reducer of the output y channel may be specified via the reduce option, which defaults to first. To default to zero instead of showing gaps in data, as when the observed value represents a quantity, use the sum reducer.

Plot.lineY(observations, {x: "date", y: "temperature", interval: d3.utcDay})
The interval option is recommended to “regularize” sampled data; for example, if your data represents timestamped temperature measurements and you expect one sample per day, use d3.utcDay as the interval.
 * @link TODO: unclear where to link
 * TODO: accept number or Date (for e.g., d3.utcYear)
 */
export type Interval = number | IntervalObject;
export type IntervalObject = {
  floor: (v: number) => number;
  offset: (v: number) => number;
  range: (lo: number, hi: number) => number[];
};

/**
 * The Plot.normalizeX and Plot.normalizeY transforms normalize series values relative to the given basis. For example, if the series values are [y₀, y₁, y₂, …] and the first basis is used, the mapped series values would be [y₀ / y₀, y₁ / y₀, y₂ / y₀, …] as in an index chart. The basis option specifies how to normalize the series values. The following basis methods are supported:
 *
 * * first - the first value, as in an index chart; the default
 * * last - the last value
 * * min - the minimum value
 * * max - the maximum value
 * * mean - the mean value (average)
 * * median - the median value
 * * pXX - the percentile value, where XX is a number in [00,99]
 * * sum - the sum of values
 * * extent - the minimum is mapped to zero, and the maximum to one
 * * deviation - each value is transformed by subtracting the mean and then dividing by the standard deviation
 * * a function to be passed an array of values, returning the desired basis
 */
export type Basis =
  | "first"
  | "last"
  | "min"
  | "max"
  | "median"
  | "p50"
  | "p95"
  | pXX
  | "sum"
  | "extent"
  | "deviation"
  | BasisFunction;
type BasisFunction = (V: ValueArray) => Value;

/**
 * Other Mark options
 */
type OtherMarkOptions<T extends Datum> = {
  // the following are necessarily channels
  title?: Accessor<T>;
  href?: Accessor<T>;
  ariaLabel?: Accessor<T>;
  // filter & sort
  filter?: Accessor<T>;
  sort?: SortOption | null;
  reverse?: boolean;
  // include in facet
  facet?: "auto" | "include" | "exclude" | boolean | null;
  // interval
  interval?: number | Interval;
  // basis for the normalize transform
  basis?: Basis;
  // transform
  transform?: TransformOption<T>;
  initializer?: InitializerOption<T>;
};

/**
 * Aggregation options for Series transforms (group, bin, sort…):
 * * a string describing an aggregation (first, min, sum, count…)
 * * a function - passed the array of values for each series
 * * an object with a reduce method, an optionally a scope
 * @link https://github.com/observablehq/plot/blob/main/README.md#group
 */
export type AggregationMethod =
  | ((
      | "first"
      | "last"
      | "count"
      | "sum"
      | "proportion"
      | "proportion-facet"
      | "min"
      | "min-index"
      | "max"
      | "max-index"
      | "mean"
      | "median"
      | "mode"
      | "p25"
      | "p95"
      | pXX
      | "deviation"
      | "variance"
      | AggregationFunction
    ) & {reduce?: never}) // duck-typing in maybeReduce
  | Aggregate;

/**
 * An object with a reduce method, and optionally a scope, for the group transform or the bin transform
 *
 * the reduce method is repeatedly passed three arguments: the index for each bin (an array
 * of integers), the input channel’s array of values, and the extent of the bin (an object
 * {x1, x2, y1, y2}); it must then return the corresponding aggregate value for the bin.
 * If the reducer object’s scope is “data”, then the reduce method is first invoked for the
 * full data; the return value of the reduce method is then made available as a third argument
 * (making the extent the fourth argument). Similarly if the scope is “facet”, then the reduce
 * method is invoked for each facet, and the resulting reduce value is made available while
 * reducing the facet’s bins. (This optional scope is used by the proportion and proportion-facet
 * reducers.)
 * @link https://github.com/observablehq/plot/blob/main/README.md#bin
 * @link https://github.com/observablehq/plot/blob/main/README.md#group
 */

export type Aggregate = {
  label?: string;
  reduce: (
    I: Series,
    X: ValueArray,
    contextOrExtent?: Value | BinExtent | null,
    extent?: BinExtent
  ) => Value | null | undefined;
  scope?: "data" | "facet";
};

/**
 * The extent of a bin, for extent-based reducers
 */
export type BinExtent = {
  x1?: number | Date;
  x2?: number | Date;
  y1?: number | Date;
  y2?: number | Date;
};

type AggregationFunction = (values?: ValueArray, extent?: BinExtent) => Value;

/**
 * The sort option, inside a mark, might sort the mark's data if specified as a string or a function.
 * If specified as an object, it will sort the domain of an associated scale
 * @link https://github.com/observablehq/plot/blob/main/README.md#transforms
 * @link https://github.com/observablehq/plot/blob/main/README.md#sort-options
 */
export type SortOption = (
  | // Field, accessor or comparator
  ((string | ((d: Datum) => Datum) | Comparator) & {value?: never; channel?: never}) // duck-typing in isDomainSort
  | ChannelSortOption
  | DomainSortOption
) & {transform?: never}; // duck-typing in isOptions

/**
 * A comparator function returns a number to sort two values
 */
export type Comparator = (a: Datum, b: Datum) => number;

type SortChannel = "x" | "y" | "r" | "data";

type ChannelSortOption = {
  channel: SortChannel;
  order?: "descending" | "ascending" | "none"; // TODO
  value?: never; // duck-typing in isDomainSort
};

export type DomainSortOption = {
  x?: SortChannel | SortValue;
  y?: SortChannel | SortValue;
  fx?: SortChannel | SortValue;
  fy?: SortChannel | SortValue;
  color?: SortChannel | SortValue;
  reduce?: AggregationMethod;
  reverse?: boolean;
  limit?: number | [number, number];
  channel?: never; // duck-typing in isDomainSort
  value?: never; // duck-typing in isDomainSort
};
type SortValue = {
  value: SortChannel;
  reduce?: AggregationMethod;
  reverse?: boolean;
  limit?: number | [number, number];
};

/**
 * Definition for the transform and initializer functions.
 */
export type TransformFunction<T extends Datum> = (
  this: InstantiatedMark<T>,
  data: DataArray<T>,
  facets: Series[]
) => {data: DataArray<T>; facets: Series[]; channels?: never};

/**
 * Plot’s transforms provide a convenient mechanism for transforming data as part of a plot specification.
 * @link https://github.com/observablehq/plot/blob/main/README.md#transforms
 */
export type TransformOption<T extends Datum> = TransformFunction<T> | null | undefined;

/**
 * Initializers can be used to transform and derive new channels prior to rendering. Unlike transforms which
 * operate in abstract data space, initializers can operate in screen space such as pixel coordinates and colors.
 * For example, initializers can modify a marks’ positions to avoid occlusion. Initializers are invoked *after*
 * the initial scales are constructed and can modify the channels or derive new channels; these in turn may (or
 * may not, as desired) be passed to scales.
 * @link https://github.com/observablehq/plot/blob/main/README.md#initializers
 */
export type InitializerFunction<T extends Datum> = (
  this: InstantiatedMark<T>,
  data: DataArray<T>,
  facets: Series[],
  channels?: any,
  scales?: any,
  dimensions?: Dimensions
) => {data: DataArray<T>; facets: Series[]; channels?: any};
export type InitializerOption<T extends Datum> = InitializerFunction<T> | TransformOption<T>; // TODO

/**
 * The bin transform’s value option
 *
 * To control how the quantitative dimensions x and y are divided into bins,
 * the following options are supported:
 * * thresholds - the threshold values; see below
 * * interval - an alternative method of specifying thresholds
 * * domain - values outside the domain will be omitted
 * * cumulative - if positive, each bin will contain all lesser bins
 *
 * These options may be specified either on the options or outputs object. If the domain option is not specified, it defaults to the minimum and maximum of the corresponding dimension (x or y), possibly niced to match the threshold interval to ensure that the first and last bin have the same width as other bins. If cumulative is negative (-1 by convention), each bin will contain all greater bins rather than all lesser bins, representing the complementary cumulative distribution.
 *
 * To pass separate binning options for x and y, the x and y input channels can be specified as an object with the options above and a value option to specify the input channel values.
 *
 * The thresholds option may be specified as a named method or a variety of other ways:
 *
 * * auto (default) - Scott’s rule, capped at 200
 * * freedman-diaconis - the Freedman–Diaconis rule
 * * scott - Scott’s normal reference rule
 * * sturges - Sturges’ formula
 * * a count (hint) representing the desired number of bins
 * * an array of n threshold values for n + 1 bins
 * * an interval or time interval (for temporal binning; see below)
 * * a function that returns an array, count, or time interval
 *
 * If the thresholds option is specified as a function, it is passed three arguments: the array of input values, the domain minimum, and the domain maximum. If a number, d3.ticks or d3.utcTicks is used to choose suitable nice thresholds. If an interval, it must expose an interval.floor(value), interval.ceil(value), interval.offset(value), and interval.range(start, stop) methods. If the interval is a time interval such as d3.utcDay, or if the thresholds are specified as an array of dates, then the binned values are implicitly coerced to dates. Time intervals are intervals that are also functions that return a Date instance when called with no arguments.
 *
 * If the interval option is used instead of thresholds, it may be either an interval, a time interval, or a number. If a number n, threshold values are consecutive multiples of n that span the domain; otherwise, the interval option is equivalent to the thresholds option. When the thresholds are specified as an interval, and the default domain is used, the domain will automatically be extended to start and end to align with the interval.
 *
 * @link https://github.com/observablehq/plot/blob/main/README.md#bin
 */
export type BinValue<T extends Datum> = {
  value?: Accessor<T>;
  thresholds?: any;
  interval?: number | IntervalObject;
  domain?: number[] | ((V: ValueArray) => ValueArray);
  cumulative?: number | boolean;
  //        order?: "descending" | "ascending" | Comparator;
  //        reverse?: boolean;
};

/**
 * The group transform's output options
 */
export type OutputOptions<T extends Datum> = Partial<{[P in keyof CommonChannelOptions<T>]: AggregationMethod}> & {
  data?: any; // TODO: this option is not tested in any example, and not documented (https://github.com/observablehq/plot/pull/272)
  title?: AggregationMethod;
  href?: AggregationMethod;
  filter?: AggregationMethod | null;
  sort?: AggregationMethod;
  reverse?: boolean;
  interval?: number | Interval;
} & BinOptions<T>;

export type Reducer<T extends Datum> = {
  name?: keyof OutputOptions<T>;
  output: GetColumn;
  initialize: (data: DataArray<T>) => void;
  scope: (scope: Aggregate["scope"], I?: Series) => void;
  reduce: (I: Series, extent?: BinExtent) => ValueArray;
  label?: string;
};

/**
 * The shuffle transform’s seed option
 * @link https://github.com/observablehq/plot/blob/main/README.md#plotshuffleoptions
 */
export type ShuffleOptions = {
  seed?: null | number;
};

/**
 * Map methods for Plot.map, Plot.mapX, Plot.mapY
 * * cumsum - a cumulative sum
 * * rank - the rank of each value in the sorted array
 * * quantile - the rank, normalized between 0 and 1
 * * a function to be passed an array of values, returning new values
 * * an object that implements the map method
 */
export type MapMethods = "cumsum" | "rank" | "quantile" | ((S: ValueArray) => ValueArray) | MapMethod; // duck-typing in maybeMap

export type MapMethod = {map: (I: Series, S: ValueArray, T: ValueArray) => void};

/**
 * Selects the points of each series selected by the selector, which can be specified
 * either as a function which receives as input the index of the series, the shorthand
 * “first” or “last”, or as a {key: value} object with exactly one key being the name
 * of a channel and the value being a function which receives as input the index of the
 * series and the channel values. The value may alternatively be specified as the
 * shorthand “min” and “max” which respectively select the minimum and maximum points
 * for the specified channel.
 * @link https://github.com/observablehq/plot/blob/main/README.md#plotselectselector-options
 */
export type Selector = ((I: Series) => Series) | "first" | "last" | Record<string, SelectorFunction>;
export type SelectorFunction = "min" | "max" | ((I: Series, X: ValueArray) => Series);

/**
 * Stack options
 * @link https://github.com/observablehq/plot/blob/main/README.md#stack
 */
type StackOptions = {offset?: Offset; order?: StackOrder; reverse?: boolean};

/**
 * Stack order options:
 * The following order methods are supported:
 *
 * * null - input order (default)
 * * value - ascending value order (or descending with reverse)
 * * sum - order series by their total value
 * * appearance - order series by the position of their maximum value
 * * inside-out - order the earliest-appearing series on the inside
 * * a named field or function of data - order data by priority
 * * an array of z values
 * @link https://github.com/observablehq/plot/blob/main/README.md#stack
 */
export type StackOrder =
  | null
  | "value"
  | "sum"
  | "appearance"
  | "inside-out"
  | string
  | ((d: Datum) => Value)
  | ValueArray;

/**
 * Stack offset options
 *
 * After all values have been stacked from zero, an optional offset can be applied to translate or scale the stacks. The following offset methods are supported:
 *
 * * null - a zero baseline (default)
 * * expand (or normalize) - rescale each stack to fill [0, 1]
 * * center (or silhouette) - align the centers of all stacks
 * * wiggle - translate stacks to minimize apparent movement
 * * a function to be passed a nested index, and start, end, and z values
 *
 * If a given stack has zero total value, the expand offset will not adjust the stack’s position. Both the center and wiggle offsets ensure that the lowest element across stacks starts at zero for better default axes. The wiggle offset is recommended for streamgraphs, and if used, changes the default order to inside-out; see Byron & Wattenberg.
 *
 * If the offset is specified as a function, it will receive four arguments: an index of stacks nested by facet and then stack, an array of start values, an array of end values, and an array of z values. For stackX, the start and end values correspond to x1 and x2, while for stackY, the start and end values correspond to y1 and y2. The offset function is then responsible for mutating the arrays of start and end values, such as by subtracting a common offset for each of the indices that pertain to the same stack.
 */
type Offset = null | "expand" | "center" | "wiggle" | OffsetFunction;
export type OffsetFunction = (stacks: Series[][], Y1: Float64Array, Y2: Float64Array, Z?: ValueArray | null) => void;

/**
 * Window options
 *
 * The Plot.windowX and Plot.windowY transforms compute a moving window around each data point and then derive a summary statistic from values in the current window, say to compute rolling averages, rolling minimums, or rolling maximums. These transforms also take additional options:
 *
 * * k - the window size (the number of elements in the window)
 * * anchor - how to align the window: start, middle, or end
 * * reduce - the aggregation method (window reducer)
 * * strict - if true, output undefined if any window value is undefined; defaults to false
 *
 * If the strict option is true, the output start values or end values or both (depending on the anchor) of each series may be undefined since there are not enough elements to create a window of size k; output values may also be undefined if some of the input values in the corresponding window are undefined. If the strict option is false (the default), the window will be automatically truncated as needed, and undefined input values are ignored. For example, if k is 24 and anchor is middle, then the initial 11 values have effective window sizes of 13, 14, 15, … 23, and likewise the last 12 values have effective window sizes of 23, 22, 21, … 12. Values computed with a truncated window may be noisy; if you would prefer to not show this data, set the strict option to true.
 *
 * The following window reducers are supported:
 *
 * * min - the minimum
 * * max - the maximum
 * * mean - the mean (average)
 * * median - the median
 * * mode - the mode (most common occurrence)
 * * pXX - the percentile value, where XX is a number in [00,99]
 * * sum - the sum of values
 * * deviation - the standard deviation
 * * variance - the variance per Welford’s algorithm
 * * difference - the difference between the last and first window value
 * * ratio - the ratio of the last and first window value
 * * first - the first value
 * * last - the last value
 * * a function to be passed an array of k values
 *
 * @link https://github.com/observablehq/plot/blob/main/README.md#plotwindowk
 */
export type WindowOptions = {
  k?: number;
  anchor?: "start" | "middle" | "end";
  reduce?:
    | "min"
    | "max"
    | "mean"
    | "median"
    | "mode"
    | "p25"
    | "p95"
    | pXX
    | "sum"
    | "deviation"
    | "variance"
    | "difference"
    | "ratio"
    | "first"
    | "last"
    | ((values: ValueArray) => Value);
  strict?: boolean;
  shift?: "deprecated";
};

/**
 * The bin options can be specified as part of the inputs or of the outputs
 */
export type BinOptions<T extends Datum> = {
  value?: Accessor<T>;
  cumulative?: boolean;
  domain?: number[];
  thresholds?: number | number[];
  interval?: number | IntervalObject;
};

/**
 * Mark options (as passed by the user or returned by a transform)
 */
export type MarkOptions<T extends Datum> = CommonChannelOptions<T> &
  ConstantStyleOptions &
  InsetOptions &
  BinOptions<T> &
  StackOptions &
  WindowOptions &
  OtherMarkOptions<T>;
export type LineOptions<T extends Datum> = MarkOptions<T> & MarkerOptions;
// export type RectOptions = MarkOptions & InsetOptions; // TODO: only add inset options where they are meaningful (bars, rects, etc)

/**
 * The scales passed to a mark's render function
 */
export type Scales = {
  x?: Scale;
  y?: Scale;
  r?: Scale;
  length?: Scale;
  opacity?: Scale;
};

type Scale = any; // TODO

/**
 * The dimensions passed to a mark's render function
 */
export type Dimensions = {
  width: pixels;
  height: pixels;
  marginLeft: pixels;
  marginRight: pixels;
  marginTop: pixels;
  marginBottom: pixels;
};

/**
 * A marker defines a graphic drawn on vertices of a delaunay, line or a link mark
 * @link https://github.com/observablehq/plot/blob/main/README.md#markers
 */
export type MarkerOption =
  | "none"
  | "arrow"
  | "dot"
  | "circle"
  | "circle-stroke"
  | MarkerFunction
  | boolean
  | null
  | undefined;
export type MarkerOptions = {
  marker?: MarkerOption;
  markerStart?: MarkerOption;
  markerMid?: MarkerOption;
  markerEnd?: MarkerOption;
};
export type MarkerFunction = (color: string, document: Context["document"]) => SVGElement;
type MaybeMarkerFunction = MarkerFunction | null;

/**
 * Ordinal color schemes
 */
export type OrdinalSchemes =
  | "accent"
  | "category10"
  | "dark2"
  | "paired"
  | "pastel1"
  | "pastel2"
  | "set1"
  | "set2"
  | "set3"
  | "tableau10"
  | "brbg"
  | "prgn"
  | "piyg"
  | "puor"
  | "rdbu"
  | "rdgy"
  | "rdylbu"
  | "rdylgn"
  | "spectral"
  | "burd"
  | "buylrd"
  | "blues"
  | "greens"
  | "greys"
  | "oranges"
  | "purples"
  | "reds"
  | "turbo"
  | "viridis"
  | "magma"
  | "inferno"
  | "plasma"
  | "cividis"
  | "cubehelix"
  | "warm"
  | "cool"
  | "bugn"
  | "bupu"
  | "gnbu"
  | "orrd"
  | "pubu"
  | "pubugn"
  | "purd"
  | "rdpu"
  | "ylgn"
  | "ylgnbu"
  | "ylorbr"
  | "ylorrd"
  | "rainbow"
  | "sinebow";

/**
 * Quantitative color schemes
 */
export type QuantitativeSchemes = DivergingSchemes | SequentialSchemes | CyclicalSchemes;

/**
 * Diverging color schemes
 */
type DivergingSchemes =
  | "brbg"
  | "prgn"
  | "piyg"
  | "puor"
  | "rdbu"
  | "rdgy"
  | "rdylbu"
  | "rdylgn"
  | "spectral"
  | "burd"
  | "buylrd";

/**
 * Sequential color schemes
 */
type SequentialSchemes =
  | "blues"
  | "greens"
  | "greys"
  | "purples"
  | "reds"
  | "oranges"
  | "turbo"
  | "viridis"
  | "magma"
  | "inferno"
  | "plasma"
  | "cividis"
  | "cubehelix"
  | "warm"
  | "cool"
  | "bugn"
  | "bupu"
  | "gnbu"
  | "orrd"
  | "pubugn"
  | "pubu"
  | "purd"
  | "rdpu"
  | "ylgnbu"
  | "ylgn"
  | "ylorbr"
  | "ylorrd";

/**
 * Cyclical color schemes
 */
type CyclicalSchemes = "rainbow" | "sinebow";

/**
 * The context in which Plot operates
 */
export interface Context {
  document: Document;
}

/**
 * Know symbols for dots
 * @link https://github.com/observablehq/plot/blob/main/README.md#dot
 */
export type SymbolName =
  | "asterisk"
  | "circle"
  | "cross"
  | "diamond"
  | "diamond2"
  | "hexagon"
  | "plus"
  | "square"
  | "square2"
  | "star"
  | "times"
  | "triangle"
  | "triangle2"
  | "wye";

/**
 * A symbol object with a draw function
 * @link https://github.com/d3/d3-shape/blob/main/README.md#custom-symbol-types
 */
export type SymbolObject = {draw: (context: CanvasPath, size: number) => void};

/**
 * A restrictive definition of D3 selections
 */
export type Selection = {
  append: (name: string) => Selection;
  attr: (name: string, value: any) => Selection;
  call: (callback: (selection: Selection, ...args: any[]) => void, ...args: any[]) => Selection;
  each: (callback: (d: any) => void) => Selection;
  filter: (filter: (d: any, i: number) => boolean) => Selection;
  property: (name: string, value: any) => Selection;
  style: (name: string, value: any) => Selection;
  text: (value: any) => Selection;
  [Symbol.iterator]: () => IterableIterator<SVGElement | HTMLElement>;
};
