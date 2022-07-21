/* eslint-disable @typescript-eslint/no-explicit-any */

/*
 * API
 */

/**
 * Aggregation options for the group transform:
 * * a string describing an aggregation (first, min, sum, count…)
 * * a function - passed the array of values for each group
 * * an object with a reduce method, an optionally a scope
 * @link https://github.com/observablehq/plot/blob/main/README.md#group
 */
export type AggregationMethod = "first" | "last" | "count" | "sum" | "proportion" | "proportion-facet" | "min" | "min-index" | "max" | "max-index" | "mean" | "median" | "mode" | PXX | "deviation" | "variance" | ReduceFunction | Reduce1;
export type Reduce1 = {
  label?: string;
  reduce: (I: IndexArray, X: any, context?: any, extent?: any) => any;
  scope?: "data" | "facet"
}; // TODO: rename to ReduceMethod + ReduceObject?
type ReduceFunction = ((data?: ArrayLike<any>, extent?: any) => any);

/**
 * Facets expressed as an array of arrays of indices
 */
export type MaybeFacetArray = IndexArray[] | undefined;

/**
 * Array of indices into the data
 */
 export type IndexArray = number[] | Uint32Array;


/**
 * The inset option is a number
 */
export type InsetOption = number | undefined;

/**
 * Plot.column()
 * @link https://github.com/observablehq/plot/blob/main/README.md#plotcolumnsource
 */
export type Column = [column, setColumn];
export type column = {transform: () => any[]; label?: string}
export type setColumn = (v: Array<any>) => Array<any>;
 

/**
 * Map methods for Plot.map, Plot.mapX, Plot.mapY
 * * cumsum - a cumulative sum
 * * rank - the rank of each value in the sorted array
 * * quantile - the rank, normalized between 0 and 1
 * * a function to be passed an array of values, returning new values
 * * an object that implements the map method
 */
export type MapMethod = "cumsum" | "rank" | "quantile" | ((S: Channel) => Channel) | {map: (I: IndexArray, S: Channel, T: any[]) => any};

/*
 * COMMON
 */


/*
 * UNSORTED
 */

export type nullish = null | undefined;
export type DataSource = Iterable<any> | ArrayLike<any>;
export type UserOption = unknown; // TODO: remove this type by checking which options are allowed in each case
export type booleanOption = boolean | nullish;
export type numberOption = number | nullish;
export type stringOption = number | any[] | string | nullish;
export type TextChannel = string[];
export type NumberChannel = number[] | Float32Array | Float64Array;
export type Channel = TextChannel | NumberChannel | any[];
export type ConstantOrFieldOption = string | IAccessor | number | Channel | Date | ITransform | nullish;
export type Comparator = (a: any, b: any) => number;

/**
 * Definition for both transform and initializer functions.
 * TODO: clarify the difference (when facets are returned or not, in the case of an initializer)
 */
export type TransformFunction = (this: IMark, data: any, facets: MaybeFacetArray, channels?: any, scales ?: any, dimensions?: IDimensions) => {data?: any, facets?: IndexArray[], channels?: any};


export type OutputOptions = Partial<{[P in FieldOptionsKey]: AggregationMethod}> & {
  data?: any;
  reverse?: boolean;
}



export interface FieldOptions {
  x?: ConstantOrFieldOption;
  x1?: ConstantOrFieldOption;
  x2?: ConstantOrFieldOption;
  y?: ConstantOrFieldOption;
  y1?: ConstantOrFieldOption;
  y2?: ConstantOrFieldOption;
  z?: ConstantOrFieldOption;
  fill?: ConstantOrFieldOption;
  stroke?: ConstantOrFieldOption;
  title?: ConstantOrFieldOption;
  href?: ConstantOrFieldOption;
  filter?: ConstantOrFieldOption;
  sort?: ConstantOrFieldOption;
}

export interface MarkOptionsDefined extends FieldOptions {
  transform?: TransformFunction | null;
  initializer?: TransformFunction | null;
  reverse?: boolean;
}

export type FieldOptionsKey = keyof FieldOptions;
export type MarkOptions = MarkOptionsDefined | undefined;
export type ArrayType = ArrayConstructor | Float32ArrayConstructor | Float64ArrayConstructor;
export type IAccessor = (d: any, i: number, data?: ArrayLike<any>) => any;
export type booleanish = boolean | undefined;
export type ITransform = {transform: (data: DataSource) => DataSource};

/**
 * The document context, used to create new DOM elements.
 * @link https://github.com/observablehq/plot/blob/main/README.md#layout-options
 */
export interface IContext {
  document: Document;
}

/**
 * A restrictive definition of D3 selections
 */
export interface ISelection {
  append: (name: string) => ISelection;
  attr: (name: string, value: any) => ISelection;
  call: (callback: (selection: ISelection, ...args: any[]) => void, ...args: any[]) => ISelection;
  each: (callback: (d: any) => void) => ISelection;
  filter: (filter: (d: any, i: number) => boolean) => ISelection;
  property: (name: string, value: any) => ISelection;
  style: (name: string, value: any) => ISelection;
  text: (value: any) => ISelection;
  [Symbol.iterator]: () => IterableIterator<SVGElement | HTMLElement>;
}

/**
 * A restrictive definition of D3 scales
 */
export interface IScale {
  bandwidth?: () => number;
}

/**
 * An object of style definitions to apply to DOM elements
 */
export type IStyleObject = Record<string, any>;

/**
 * A mark
 * @link https://github.com/observablehq/plot/blob/main/README.md#mark-options
 */
export interface IMark {
  z?: UserOption; // copy the user option for error messages
  clip?: "frame";
  dx: number;
  dy: number;
  marker?: MaybeMarkerFunction;
  markerStart?: MaybeMarkerFunction;
  markerMid?: MaybeMarkerFunction;
  markerEnd?: MaybeMarkerFunction;
  stroke?: string | nullish;
  // common styles
  fill?: string | nullish;
  fillOpacity?: number | nullish;
  strokeWidth?: number | nullish;
  strokeOpacity?: number | nullish;
  strokeLinejoin?: string | nullish;
  strokeLinecap?: string | nullish;
  strokeMiterlimit?: number | nullish;
  strokeDasharray?: string | nullish;
  strokeDashoffset?: string | nullish;
  target?: string | nullish;
  ariaLabel?: string | nullish;
  ariaDescription?: string | nullish;
  ariaHidden?: string | nullish; // "true" | "false" | undefined
  opacity?: number | nullish;
  mixBlendMode?: string | nullish;
  paintOrder?: string | nullish;
  pointerEvents?: string | nullish;
  shapeRendering?: string | nullish;
  // other styles, some of which are not supported by all marks
  frameAnchor?: string;
}

/**
 * A key: value record of channels values
 */
export type ChannelObject = Record<string, TextChannel | NumberChannel>;

/**
 * The dimensions of the plot or the facet
 */
export interface IDimensions {
  width: number;
  height: number;
  marginLeft: number;
  marginRight: number;
  marginTop: number;
  marginBottom: number;
}

/*
 * Reducers
 */

type Digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
/**
 * Percentile reducer, for transforms such as bin, group, map and window
 * @link https://github.com/observablehq/plot/blob/main/README.md#bin
 */
export type PXX = `p${Digit}${Digit}`;

/**
 * A marker defines a graphic drawn on vertices of a line or a link mark
 * @link https://github.com/observablehq/plot/blob/main/README.md#markers
 */
export type MarkerOption = string | boolean | nullish;
export type MarkerFunction = (color: any, context: any) => Element;
export type MaybeMarkerFunction = MarkerFunction | null;
