/* eslint-disable @typescript-eslint/no-explicit-any */

type UnknownFn = (d: unknown) => unknown;
type Field = string | UnknownFn;
export type nullish = null | undefined;
export type DataSource = Iterable<unknown> | ArrayLike<unknown>;
export type DataSourceOptional = DataSource | nullish;
export type UserOption = unknown;
export type booleanOption = boolean | nullish;
export type numberOption = number | nullish;
export type stringOption = number | any[] | string | nullish;
export type TextChannel = string[];
export type NumberChannel = string[];
type Channel = TextChannel | NumberChannel | any[];
export type ConstantOrFieldOption = numberOption | stringOption | Field | Channel | nullish;

export interface UserOptionsDefined {
  x?: ConstantOrFieldOption;
  x1?: ConstantOrFieldOption;
  x2?: ConstantOrFieldOption;
  y?: ConstantOrFieldOption;
  y1?: ConstantOrFieldOption;
  y2?: ConstantOrFieldOption;
  z?: ConstantOrFieldOption;
  fill?: ConstantOrFieldOption;
  stroke?: ConstantOrFieldOption;
  filter?: ConstantOrFieldOption;
  transform?: ConstantOrFieldOption;
}
export type UserOptionsKey = "x" | "x1" | "x2" | "y" | "y1" | "y2" | "z" | "fill" | "stroke";
export type UserOptions = UserOptionsDefined | undefined;
export type ObjectDatum = Record<string, unknown>;
export type ArrayType = ArrayConstructor | Float32ArrayConstructor | Float64ArrayConstructor;
export type IAccessor = (d: any, i: number, data?: ArrayLike<any>) => any;
export type booleanish = boolean | undefined;
export interface ITransform {
  transform: (data: DataSource) => DataSource;
}

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
