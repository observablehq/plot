/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  ArrayType,
  Constructor,
  Data,
  DataArray,
  Datum,
  FieldNames,
  index,
  Row,
  Series,
  TypedArray,
  TypedArrayConstructor,
  Value,
  ValueArray
} from "./data.js";
import {parse as isoParse} from "isoformat";
import {color, descending, quantile} from "d3";

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray
const TypedArray = Object.getPrototypeOf(Uint8Array);
const objectToString = Object.prototype.toString;

/**

#### Plot.valueof(*data*, *value*, *type*)

Given an iterable *data* and some *value* accessor, returns an array (a column) of the specified *type* with the corresponding value of each element of the data. The *value* accessor may be one of the following types:

- a string - corresponding to the field accessor (`d => d[value]`)
- an accessor function - called as *type*.from(*data*, *value*)
- a number, Date, or boolean — resulting in an array uniformly filled with the *value*
- an object with a transform method — called as *value*.transform(*data*)
- an array of values - returning the same
- null or undefined - returning the same

If *type* is specified, it must be Array or a similar class that implements the [Array.from](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from) interface such as a typed array. When *type* is Array or a typed array class, the return value of valueof will be an instance of the same (or null or undefined). If *type* is not specified, valueof may return either an array or a typed array (or null or undefined).

Plot.valueof is not guaranteed to return a new array. When a transform method is used, or when the given *value* is an array that is compatible with the requested *type*, the array may be returned as-is without making a copy.

@link https://github.com/observablehq/plot/blob/main/README.md#plotvalueofdata-value-type

*/

export function valueof<T extends undefined | null>(data: T, v: Accessor<T, any>, t?: ArrayType): T;
export function valueof<T extends Datum, U extends TypedArray>(
  data: Data<T>,
  v: Accessor<T, any> | number | Date | boolean,
  type: Constructor<U>
): U;
export function valueof<V extends number | Date | boolean>(d: Data<Datum>, value: V, t?: ArrayType): V[];
export function valueof<T extends Datum, U extends keyof T>(
  data: Data<T>,
  value: U,
  arrayType?: ArrayConstructor
): T[U][];
export function valueof<T extends Datum, U extends Value>(
  data: Data<T>,
  value: AccessorFunction<T, U>,
  arrayType?: ArrayConstructor
): U[];
export function valueof<T extends Datum>(data: Data<T>, value: Accessor<T, Value>, arrayType?: ArrayType): ValueArray;
export function valueof<T extends Datum, U extends Value, V extends ArrayType>(
  data: Data<T> | null | undefined,
  value: Accessor<T, U> | number | Date | boolean | null | undefined,
  arrayType: V = Array as V
): ValueArray | null | undefined {
  return typeof value === "string"
    ? data && map(data as Data<Row>, field(value), arrayType)
    : typeof value === "function"
    ? data && map(data, value, arrayType)
    : typeof value === "number" || value instanceof Date || typeof value === "boolean"
    ? data && map(data, constant(value), arrayType)
    : value && isTransform(value)
    ? arrayify(value.transform(data), arrayType)
    : arrayify(value, arrayType); // preserve undefined type
}

/**
 * See Plot.valueof()
 */
export type Accessor<T extends Datum, U extends Value> =
  | FieldNames<T>
  | AccessorFunction<T, U>
  | Iterable<U>
  | TransformMethod;
export type AccessorValue<T extends Datum, U extends Value, V extends Accessor<T, U>> = V extends keyof T
  ? T[V]
  : V extends AccessorFunction<T, infer Val>
  ? Val
  : never;
type AccessorFunction<T, U extends Value> = (d: T, i: number) => U;

export type TransformMethod<T = any, U = Value> = {
  transform: (data: T) => Iterable<U>;
  label?: string;
};

function isTransform<T extends Datum, U extends Value>(value: ColorAccessor<T, U>): value is TransformMethod {
  return isObject(value) && typeof (value as TransformMethod).transform == "function";
}

// eslint-disable-next-line @typescript-eslint/ban-types
export type ColorAccessor<T extends Datum, U extends Value> = Accessor<T, U> | (string & {});

// TODO: type this
// This function serves as default when no accessor is specified
// It assumes that the Data is already an Iterable of Values.
export const identity = {transform: (data: any): ValueArray => data};
export const field =
  <T extends Row>(name: keyof T) =>
  (d: T | undefined | null) =>
    d && d[name];
export const indexOf = (d: Datum, i: index) => i;
export const zero = () => 0;
export const one = () => 1;
export const yes = () => true;
export const string = (x: any) => (x == null ? x : `${x}`);
export const number = (x: any) => (x == null ? x : +x);
export const boolean = (x: any) => (x == null ? x : !!x);

export const first = (x: Value[] | [Value, any] | null | undefined) => x && x[0];
export const second = (x: Value[] | null | undefined) => x && x[1];
export const constant =
  <T extends Value>(x: T) =>
  () =>
    x;

/**
 * A percentile reducer, specified by a string like “p25”
 */
// Converts a string like “p25” into a function that takes an index I and an
// accessor function f, returning the corresponding percentile value.
export function percentile(reduce: pXX): (I: Series, f: (i: index) => any) => number | undefined {
  const p = +`${reduce}`.slice(1) / 100;
  return (I: Series, f: (i: index) => any) => quantile(I, p, f);
}

// eslint-disable-next-line @typescript-eslint/ban-types
export type pXX = `p${Digit}${Digit}` & {};
type Digit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";

// Some channels may allow a string constant to be specified; to differentiate
// string constants (e.g., "red") from named fields (e.g., "date"), this
// function tests whether the given value is a CSS color string and returns a
// tuple [channel, constant] where one of the two is undefined, and the other is
// the given value. If you wish to reference a named field that is also a valid
// CSS color, use an accessor (d => d.red) instead.
export function maybeColorChannel<T extends Datum, U extends Value>(
  value: ColorAccessor<T, U> | null | undefined,
  defaultValue?: string
): [Accessor<T, U> | undefined, undefined] | [undefined, string | null | undefined] {
  if (value === undefined) value = defaultValue;
  return value === null ? [undefined, "none"] : isColor(value) ? [undefined, value] : [value, undefined];
}

// Similar to maybeColorChannel, this tests whether the given value is a number
// indicating a constant, and otherwise assumes that it’s a channel value.
export function maybeNumberChannel<T extends Datum, U extends Value>(
  value: Accessor<T, U> | null | number | undefined,
  defaultValue?: number
): [Accessor<T, U> | null | undefined, undefined] | [undefined, number | null | undefined] {
  if (value === undefined) value = defaultValue;
  return value === null || typeof value === "number" ? [undefined, value] : [value, undefined];
}

// Validates the specified optional string against the allowed list of keywords.
export function maybeKeyword(input: null | undefined, name: string, allowed: string[]): undefined;
export function maybeKeyword(input: string, name: string, allowed: string[]): string | undefined;
export function maybeKeyword(input: string | null | undefined, name: string, allowed: string[]): string | undefined {
  if (input != null) return keyword(input, name, allowed);
}

// Validates the specified required string against the allowed list of keywords.
export function keyword(input: string | null | undefined, name: string, allowed: string[]): string {
  const i = `${input}`.toLowerCase();
  if (!allowed.includes(i)) throw new Error(`invalid ${name}: ${input}`);
  return i;
}

// Promotes the specified data to an array or typed array as needed. If an array
// type is provided (e.g., Array), then the returned array will strictly be of
// the specified type; otherwise, any array or typed array may be returned. If
// the specified data is null or undefined, returns the value as-is.
export function arrayify<T extends null | undefined>(d: T, type?: ArrayType): T;
export function arrayify<T extends TypedArray>(d: T, t?: undefined): T;
export function arrayify<T extends Value>(d: T[], t?: undefined): T[];
export function arrayify<T extends Value>(d: Iterable<T>, t?: ArrayConstructor): DataArray<T>;
export function arrayify<T extends TypedArray>(d: TypedArray | Iterable<any>, type: Constructor<T>): T;
export function arrayify<T extends Value>(
  d: Iterable<T> | null | undefined,
  t?: ArrayType
): DataArray<T> | null | undefined;
export function arrayify<T extends Datum>(d: T[], type?: ArrayConstructor): T[];
export function arrayify<T extends Datum, U extends TypedArray>(d: T[], type: Constructor<U>): U;
export function arrayify<T extends Datum>(d: Data<T>, t?: ArrayType): DataArray<T>;
export function arrayify<T extends Datum>(
  data: Data<T> | null | undefined,
  type?: ArrayType
): DataArray<T> | null | undefined {
  return data == null
    ? data
    : type === undefined
    ? data instanceof Array
      ? data
      : data instanceof TypedArray
      ? (data as TypedArray)
      : Array.from(data as T[])
    : data instanceof type
    ? data
    : (type as ArrayConstructor).from(data as T[]);
}

export type Mapper<T, U extends Value> = (d: T, i: number) => U;
export type TypedMapper<T> = (d: T, i: number) => number;

export function map<T extends Datum, U extends TypedArray>(values: Data<T>, f: TypedMapper<T>, type: Constructor<U>): U;
export function map<T extends TypedArray>(values: any, f: any, type: Constructor<T>): T;
export function map<T extends Datum, U extends Value>(values: Data<T>, f: Mapper<T, U>, type?: ArrayConstructor): U[];
export function map<T extends Datum, U extends Value>(
  values: Data<T>,
  f: Mapper<T, U>,
  type?: ArrayConstructor | TypedArrayConstructor
): U[] | TypedArray;
export function map<T extends Datum, U extends Value, V extends ArrayType>(
  values: Data<T>,
  f: Mapper<T, U>,
  type: V = Array as V
): TypedArray | U[] {
  // An optimization of type.from(values, f): if the given values are already an
  // instanceof the desired array type, the faster values.map method is used.
  return values instanceof type ? values.map(f as never) : (type as ArrayConstructor).from(values, f);
}

// An optimization of type.from(values): if the given values are already an
// instanceof the desired array type, the faster values.slice method is used.
export function slice(values: ValueArray, type: ArrayType = Array): any[] | TypedArray {
  return values instanceof type ? values.slice() : (type as ArrayConstructor).from(values);
}

export function isTypedArray(values: ValueArray): values is TypedArray {
  return values instanceof TypedArray;
}

// Disambiguates an options object (e.g., {y: "x2"}) from a primitive value.
export function isObject(option: null | undefined): false;
export function isObject(option: any): boolean;
export function isObject(option: any): boolean {
  return option?.toString === objectToString;
}

// Disambiguates a scale options object (e.g., {color: {type: "linear"}}) from
// some other option (e.g., {color: "red"}). When creating standalone legends,
// this is used to test whether a scale is defined; this should be consistent
// with inferScaleType when there are no channels associated with the scale, and
// if this returns true, then normalizeScale must return non-null.
export function isScaleOptions(option: any): boolean {
  return isObject(option) && (option.type !== undefined || option.domain !== undefined);
}

// Disambiguates an options object (e.g., {y: "x2"}) from a channel value
// definition expressed as a channel transform (e.g., {transform: …}).
export function isOptions(option: any): option is {value?: any; channel?: any; transform: never} {
  return isObject(option) && typeof (option as {transform: null}).transform !== "function";
}

// Disambiguates a sort transform (e.g., {sort: "date"}) from a channel domain
// sort definition (e.g., {sort: {y: "x"}}).
export function isDomainSort(sort: any): boolean {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return isObject(sort) && sort!.value === undefined && sort!.channel === undefined;
}

// For marks specified either as [0, x] or [x1, x2], such as areas and bars.
// TODO: move this function to stack.ts?

export function maybeZero<T extends Datum, U extends Value>(
  x: Accessor<T, U> | number | undefined,
  x1: Accessor<T, U> | number | undefined,
  x2: Accessor<T, U> | number | undefined,
  x3: Accessor<T, U> = identity
): [Accessor<T, U> | number, Accessor<T, U> | number] {
  if (x1 === undefined && x2 === undefined) {
    // {x} or {}
    x1 = 0;
    x2 = x === undefined ? x3 : x;
  } else if (x1 === undefined) {
    // {x, x2} or {x2}
    x1 = x === undefined ? 0 : x;
  } else if (x2 === undefined) {
    // {x, x1} or {x1}
    x2 = x === undefined ? 0 : x;
  }
  return [x1, x2!];
}

// For marks that have x and y channels (e.g., cell, dot, line, text).
export function maybeTuple<T>(x: T | undefined, y: T | undefined): [T | undefined, T | undefined] {
  return x === undefined && y === undefined
    ? [first as unknown as T | undefined, second as unknown as T | undefined]
    : [x, y];
}

// A helper for extracting the z channel, if it is variable. Used by transforms
// that require series, such as moving average and normalize.
type ZOptions<T extends Datum, U extends Value> = {
  fill?: ColorAccessor<T, U> | null;
  stroke?: ColorAccessor<T, U> | null;
  z?: Accessor<T, U> | null;
};
export function maybeZ<T extends Datum, U extends Value>({z, fill, stroke}: ZOptions<T, U> = {}) {
  if (z === undefined) [z] = maybeColorChannel(fill);
  if (z === undefined) [z] = maybeColorChannel(stroke);
  return z;
}

// Returns a Uint32Array with elements [0, 1, 2, … data.length - 1].
export function range(data: ArrayLike<Datum>): Uint32Array {
  const n = data.length;
  const r = new Uint32Array(n);
  for (let i = 0; i < n; ++i) r[i] = i;
  return r;
}

// Returns a filtered range of data given the test function.
export function where(data: ArrayLike<Datum>, test: (d: any, i?: index, data?: ArrayLike<Datum>) => boolean) {
  return range(data).filter((i) => test(data[i], i, data));
}

// Returns an array [values[index[0]], values[index[1]], …].
export function take(values: ValueArray, index: Series): ValueArray {
  return map(index, (i: index) => values[i]);
}

// Based on InternMap (d3.group).
export function keyof(value: Datum) {
  return value !== null && typeof value === "object" ? value.valueOf() : value;
}

// note: maybeInput doesn't type check if the field is an accessor
export function maybeInput(key: string, options: {[key: string]: any}) {
  if (options[key] !== undefined) return options[key];
  switch (key) {
    case "x1":
    case "x2":
      key = "x";
      break;
    case "y1":
    case "y2":
      key = "y";
      break;
  }
  return options[key];
}

/**

#### Plot.column([*source*])

This helper for constructing derived columns returns a [*column*, *setColumn*] array. The *column* object implements *column*.transform, returning whatever value was most recently passed to *setColumn*. If *setColumn* is not called, then *column*.transform returns undefined. If a *source* is specified, then *column*.label exposes the given *source*’s label, if any: if *source* is a string as when representing a named field of data, then *column*.label is *source*; otherwise *column*.label propagates *source*.label. This allows derived columns to propagate a human-readable axis or legend label.

Plot.column is typically used by options transforms to define new channels; the associated columns are populated (derived) when the **transform** option function is invoked.

@link https://github.com/observablehq/plot/blob/main/README.md#plotcolumnsource
 */
export function column(source: any): [GetColumn, SetColumn] {
  let value: ValueArray;
  return [
    {
      transform: () => value,
      label: labelof(source)
    },
    (v) => ((value = v), v)
  ];
}
export type GetColumn = {transform: () => ValueArray; label?: string};
type SetColumn = <T extends ValueArray | Float32Array | Float64Array>(v: T) => T;

// Like column, but allows the source to be null.
export function maybeColumn(source: any): [GetColumn, SetColumn] | [null?] {
  return source == null ? [source] : column(source);
}

export function labelof(value: string): string;
export function labelof(value: null | undefined): undefined;
export function labelof(value: any & {label: string}): string;
export function labelof(value: any & {label: string}, defaultValue: string): string;
export function labelof<T extends string | undefined>(value: null | undefined, defaultValue?: T): T;
export function labelof(value: any, defaultValue?: string): string | undefined {
  return typeof value === "string"
    ? value
    : value && (value as {label: string}).label != null
    ? (value as {label: string}).label
    : defaultValue;
}

// Assuming that both x1 and x2 and lazy columns (per above), this derives a new
// a column that’s the average of the two, and which inherits the column label
// (if any). Both input columns are assumed to be quantitative. If either column
// is temporal, the returned column is also temporal.
export function mid(x1: GetColumn, x2: GetColumn): {transform(): ValueArray; label: string | undefined} {
  return {
    transform() {
      const X1 = x1.transform();
      const X2 = x2.transform();
      return isTemporal(X1) || isTemporal(X2)
        ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          map(X1, (_, i) => new Date((+X1[i]! + +X2[i]!) / 2)) // Do we need to handle null or undefined in either of these cases?
        : // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          map(X1, (_, i) => (+X1[i]! + +X2[i]!) / 2, Float64Array); // e.g. X1[i] == null ? X1[i] : X2[i] == null ? X2[i] : ...
    },
    label: x1.label
  };
}

// This distinguishes between per-dimension options and a standalone value.
export function maybeValue(value: any) {
  return value === undefined || isOptions(value) ? value : {value};
}

// Coerces the given channel values (if any) to numbers. This is useful when
// values will be interpolated into other code, such as an SVG transform, and
// where we don’t wish to allow unexpected behavior for weird input.
export function numberChannel<T extends Datum, U extends Value>(
  source: Accessor<T, U> | null | undefined
): TransformMethod | null {
  return source == null
    ? null
    : {
        // TODO: do we need to support null | undefined for data here?
        transform: (data: Data<T>) => valueof(data, source, Float64Array),
        label: labelof(source)
      };
}

export function isIterable(value: any): value is Iterable<any> {
  return value && typeof value[Symbol.iterator] === "function";
}

export function isTextual(values: Iterable<Datum>): boolean {
  for (const value of values) {
    if (value == null) continue;
    return typeof value !== "object" || value instanceof Date;
  }
  return false;
}

export function isOrdinal(values: Iterable<Datum>): boolean {
  for (const value of values) {
    if (value == null) continue;
    const type = typeof value;
    return type === "string" || type === "boolean";
  }
  return false;
}

export function isTemporal(values: Iterable<Value>): boolean {
  for (const value of values) {
    if (value == null) continue;
    return value instanceof Date;
  }
  return false;
}

// Are these strings that might represent dates? This is stricter than ISO 8601
// because we want to ignore false positives on numbers; for example, the string
// "1192" is more likely to represent a number than a date even though it is
// valid ISO 8601 representing 1192-01-01.
export function isTemporalString(values: Iterable<Datum>): boolean {
  for (const value of values) {
    if (value == null) continue;
    return typeof value === "string" && isNaN(value as unknown as number) && (isoParse(value) as unknown as boolean);
  }
  return false;
}

// Are these strings that might represent numbers? This is stricter than
// coercion because we want to ignore false positives on e.g. empty strings.
export function isNumericString(values: Iterable<Datum>): boolean {
  for (const value of values) {
    if (value == null || value === "") continue;
    return typeof value === "string" && !isNaN(value as unknown as number);
  }
  return false;
}

export function isNumeric(values: Iterable<Datum>): boolean {
  for (const value of values) {
    if (value == null) continue;
    return typeof value === "number";
  }
  return false;
}

export function isFirst(values: IterableIterator<Datum>, is: (d: Datum) => boolean) {
  for (const value of values) {
    if (value == null) continue;
    return is(value);
  }
}

// Whereas isFirst only tests the first defined value and returns undefined for
// an empty array, this tests all defined values and only returns true if all of
// them are valid colors. It also returns true for an empty array, and thus
// should generally be used in conjunction with isFirst.
export function isEvery(values: IterableIterator<Datum>, is: (d: Datum) => boolean): boolean {
  for (const value of values) {
    if (value == null) continue;
    if (!is(value)) return false;
  }
  return true;
}

// Mostly relies on d3-color, with a few extra color keywords. Currently this
// strictly requires that the value be a string; we might want to apply string
// coercion here, though note that d3-color instances would need to support
// valueOf to work correctly with InternMap.
// https://www.w3.org/TR/SVG11/painting.html#SpecifyingPaint
export function isColor<T extends Datum, U extends Value>(v: ColorAccessor<T, U> | undefined): v is string {
  if (typeof v !== "string") return false;
  const value = v.toLowerCase().trim();
  return (
    value === "none" ||
    value === "currentcolor" ||
    (value.startsWith("url(") && value.endsWith(")")) || // <funciri>, e.g. pattern or gradient
    (value.startsWith("var(") && value.endsWith(")")) || // CSS variable
    color(value) !== null
  );
}

export function isNoneish<T extends Datum, U extends Value>(value: ColorAccessor<T, U> | null | undefined): boolean {
  return value == null || isNone(value);
}

export function isNone<T extends Datum, U extends Value>(value: ColorAccessor<T, U> | null | undefined): boolean {
  return /^\s*none\s*$/i.test(value as string);
}

export function isRound(value: string | undefined): boolean {
  return /^\s*round\s*$/i.test(value as string);
}

export function maybeFrameAnchor(value = "middle"): string {
  return keyword(value, "frameAnchor", [
    "middle",
    "top-left",
    "top",
    "top-right",
    "right",
    "bottom-right",
    "bottom",
    "bottom-left",
    "left"
  ]);
}

// Like a sort comparator, returns a positive value if the given array of values
// is in ascending order, a negative value if the values are in descending
// order. Assumes monotonicity; only tests the first and last values.
export function order(
  values: null | undefined | string[] | number[] | Float32Array | Float64Array
): number | undefined {
  if (values == null) return;
  const first = values[0];
  const last = values[values.length - 1];
  return descending(first, last);
}

// Unlike {...defaults, ...options}, this ensures that any undefined (but
// present) properties in options inherit the given default value.
export function inherit(options: Record<string, any> = {}, ...rest: Array<Record<string, any>>) {
  let o = options;
  for (const defaults of rest) {
    for (const key in defaults) {
      if (o[key] === undefined) {
        const value = defaults[key];
        if (o === options) o = {...o, [key]: value};
        else o[key] = value;
      }
    }
  }
  return o;
}

// Given an iterable of named things (objects with a name property), returns a
// corresponding object with properties associated with the given name.
export function Named(things: any): {[k: string]: unknown} {
  console.warn("named iterables are deprecated; please use an object instead");
  const names = new Set();
  return Object.fromEntries(
    Array.from(things, (thing) => {
      const {name} = thing as {name: string};
      if (name == null) throw new Error("missing name");
      const key = `${name}`;
      if (key === "__proto__") throw new Error(`illegal name: ${key}`);
      if (names.has(key)) throw new Error(`duplicate name: ${key}`);
      names.add(key);
      return [name, thing];
    })
  );
}

export function maybeNamed(things: any): any {
  return isIterable(things) ? Named(things) : things;
}
