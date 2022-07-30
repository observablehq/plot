/**
 * The mark's data contains the data for the mark; typically an array
 * of objects or values, but can also be defined as an iterable compatible
 * with Array.from.
 */
export type Data<T extends Datum> = ArrayLike<T> | Iterable<T>;
export type ObjectDatum = Record<string, Value>;
export type Datum = ObjectDatum | Value;
export type DatumKeys<T> = T extends ObjectDatum ? keyof T : never;

/**
 * An array or typed array constructor, or any class that implements Array.from
 */
export type ArrayType = ArrayConstructor | TypedArrayConstructor;

/**
 * The data is then arrayified, and a range of indices is computed, serving as pointers
 * into a the column representation of Plot.valueof
 */
export type DataArray = Datum[] | TypedArray;

/**
 * Channels are arrays of values
 */
export type Value = number | string | Date | boolean | null | undefined;
export type Channel = Value[];
export type TextChannel = string[];
export type NumberChannel = number[] | Float32Array | Float64Array;

/**
 * A series is an array of indices, used to group data into classes (e.g., groups and facets)
 */
export type index = number; // integer
export type Series = index[] | Uint32Array; // a Series is a list of pointers into columnar data
export type Facets = Series[];

export type NumericArray = number[] | TypedArray;
export type ValueArray = NumericArray | Value[];

/**
 * Typed arrays are preserved through arrayify
 */
export type TypedArray =
  | Int8Array
  | Uint8Array
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Uint8ClampedArray
  | Float32Array
  | Float64Array;

export type TypedArrayConstructor =
  | Int8ArrayConstructor
  | Uint8ArrayConstructor
  | Int16ArrayConstructor
  | Uint16ArrayConstructor
  | Int32ArrayConstructor
  | Uint32ArrayConstructor
  | Uint8ClampedArrayConstructor
  | Float32ArrayConstructor
  | Float64ArrayConstructor;
