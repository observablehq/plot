/**
 * Values are associated to screen encodings (positions, colors…) via scales.
 */
export type Value = number | string | Date | boolean | null | undefined;

/**
 * A Row represents a data point with values attached to field names; typically,
 * a row from a tabular dataset.
 */
export type Row = Record<string, Value>;

/**
 * A single Datum is either a Value or an Row; if a Row, possible field names
 * can be inferred from its keys to define accessors
 */
export type Datum = Row | Value;
export type FieldNames<T> = T extends Row ? keyof T : never;

/**
 * The marks data; typically an array of Datum, but can also
 * be defined as an iterable compatible with Array.from.
 */
export type Data<T extends Datum> = ArrayLike<T> | Iterable<T>;

/**
 * An array or typed array constructor, or any class that implements Array.from
 */
export type ArrayType = ArrayConstructor | TypedArrayConstructor;

/**
 * The data is then arrayified, and a range of indices is computed, serving as pointers
 * into the columnar representation of each channel
 */
export type DataArray = Datum[] | TypedArray;

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
