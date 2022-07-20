type UnknownFn = (d: unknown) => unknown;
type Field = string | UnknownFn;
export type DataSource = Iterable<unknown> | ArrayLike<unknown>;
export type DataSourceOptional = DataSource | null | undefined;
export type UserOption = unknown;
export type ConstantOrFieldOption = number | Field | undefined;
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
 * A D3 selection.
 */
export interface ISelection {
  attr: (name: string, value: any) => ISelection;
}

/**
 * A mark
 * @link https://github.com/observablehq/plot/blob/main/README.md#mark-options
 */
export interface IMark {
  marker?: MaybeMarkerFunction;
  markerStart?: MaybeMarkerFunction;
  markerMid?: MaybeMarkerFunction;
  markerEnd?: MaybeMarkerFunction;
  stroke?: string;
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
export type MarkerOption = string | boolean | null | undefined;
export type MarkerFunction = (color: any, context: any) => Element;
export type MaybeMarkerFunction = MarkerFunction | null;
