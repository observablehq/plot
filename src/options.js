import {parse as isoParse} from "isoformat";
import {color, descending, range as rangei, quantile} from "d3";
import {maybeTimeInterval, maybeUtcInterval} from "./time.js";

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray
export const TypedArray = Object.getPrototypeOf(Uint8Array);
const objectToString = Object.prototype.toString;

export function valueof(data, value, type) {
  const valueType = typeof value;
  return valueType === "string"
    ? maybeTypedMap(data, field(value), type)
    : valueType === "function"
    ? maybeTypedMap(data, value, type)
    : valueType === "number" || value instanceof Date || valueType === "boolean"
    ? map(data, constant(value), type)
    : typeof value?.transform === "function"
    ? maybeTypedArrayify(value.transform(data), type)
    : maybeTypedArrayify(value, type);
}

function maybeTypedMap(data, f, type) {
  return map(data, type?.prototype instanceof TypedArray ? floater(f) : f, type);
}

function maybeTypedArrayify(data, type) {
  return type === undefined
    ? arrayify(data) // preserve undefined type
    : data instanceof type
    ? data
    : type.prototype instanceof TypedArray && !(data instanceof TypedArray)
    ? type.from(data, coerceNumber)
    : type.from(data);
}

function floater(f) {
  return (d, i) => coerceNumber(f(d, i));
}

export const field = (name) => (d) => d[name];
export const indexOf = {transform: range};
export const identity = {transform: (d) => d};
export const zero = () => 0;
export const one = () => 1;
export const yes = () => true;
export const string = (x) => (x == null ? x : `${x}`);
export const number = (x) => (x == null ? x : +x);
export const boolean = (x) => (x == null ? x : !!x);
export const first = (x) => (x ? x[0] : undefined);
export const second = (x) => (x ? x[1] : undefined);
export const third = (x) => (x ? x[2] : undefined);
export const constant = (x) => () => x;

// Converts a string like “p25” into a function that takes an index I and an
// accessor function f, returning the corresponding percentile value.
export function percentile(reduce) {
  const p = +`${reduce}`.slice(1) / 100;
  return (I, f) => quantile(I, p, f);
}

// If the values are specified as a typed array, no coercion is required.
export function coerceNumbers(values) {
  return values instanceof TypedArray ? values : map(values, coerceNumber, Float64Array);
}

// Unlike Mark’s number, here we want to convert null and undefined to NaN since
// the result will be stored in a Float64Array and we don’t want null to be
// coerced to zero. We use Number instead of unary + to allow BigInt coercion.
function coerceNumber(x) {
  return x == null ? NaN : Number(x);
}

export function coerceDates(values) {
  return map(values, coerceDate);
}

// When coercing strings to dates, we only want to allow the ISO 8601 format
// since the built-in string parsing of the Date constructor varies across
// browsers. (In the future, this could be made more liberal if desired, though
// it is still generally preferable to do date parsing yourself explicitly,
// rather than rely on Plot.) Any non-string values are coerced to number first
// and treated as milliseconds since UNIX epoch.
export function coerceDate(x) {
  return x instanceof Date && !isNaN(x)
    ? x
    : typeof x === "string"
    ? isoParse(x)
    : x == null || isNaN((x = +x))
    ? undefined
    : new Date(x);
}

// Some channels may allow a string constant to be specified; to differentiate
// string constants (e.g., "red") from named fields (e.g., "date"), this
// function tests whether the given value is a CSS color string and returns a
// tuple [channel, constant] where one of the two is undefined, and the other is
// the given value. If you wish to reference a named field that is also a valid
// CSS color, use an accessor (d => d.red) instead.
export function maybeColorChannel(value, defaultValue) {
  if (value === undefined) value = defaultValue;
  return value === null ? [undefined, "none"] : isColor(value) ? [undefined, value] : [value, undefined];
}

// Similar to maybeColorChannel, this tests whether the given value is a number
// indicating a constant, and otherwise assumes that it’s a channel value.
export function maybeNumberChannel(value, defaultValue) {
  if (value === undefined) value = defaultValue;
  return value === null || typeof value === "number" ? [undefined, value] : [value, undefined];
}

// Validates the specified optional string against the allowed list of keywords.
export function maybeKeyword(input, name, allowed) {
  if (input != null) return keyword(input, name, allowed);
}

// Validates the specified required string against the allowed list of keywords.
export function keyword(input, name, allowed) {
  const i = `${input}`.toLowerCase();
  if (!allowed.includes(i)) throw new Error(`invalid ${name}: ${input}`);
  return i;
}

// Promotes the specified data to an array as needed.
export function arrayify(data) {
  return data == null || data instanceof Array || data instanceof TypedArray ? data : Array.from(data);
}

// An optimization of type.from(values, f): if the given values are already an
// instanceof the desired array type, the faster values.map method is used.
export function map(values, f, type = Array) {
  return values == null ? values : values instanceof type ? values.map(f) : type.from(values, f);
}

// An optimization of type.from(values): if the given values are already an
// instanceof the desired array type, the faster values.slice method is used.
export function slice(values, type = Array) {
  return values instanceof type ? values.slice() : type.from(values);
}

// Disambiguates an options object (e.g., {y: "x2"}) from a primitive value.
export function isObject(option) {
  return option?.toString === objectToString;
}

// Disambiguates a scale options object (e.g., {color: {type: "linear"}}) from
// some other option (e.g., {color: "red"}). When creating standalone legends,
// this is used to test whether a scale is defined; this should be consistent
// with inferScaleType when there are no channels associated with the scale, and
// if this returns true, then normalizeScale must return non-null.
export function isScaleOptions(option) {
  return isObject(option) && (option.type !== undefined || option.domain !== undefined);
}

// Disambiguates an options object (e.g., {y: "x2"}) from a channel value
// definition expressed as a channel transform (e.g., {transform: …}).
export function isOptions(option) {
  return isObject(option) && typeof option.transform !== "function";
}

// Disambiguates a sort transform (e.g., {sort: "date"}) from a channel domain
// sort definition (e.g., {sort: {y: "x"}}).
export function isDomainSort(sort) {
  return isOptions(sort) && sort.value === undefined && sort.channel === undefined;
}

// For marks specified either as [0, x] or [x1, x2], such as areas and bars.
export function maybeZero(x, x1, x2, x3 = identity) {
  if (x1 === undefined && x2 === undefined) {
    // {x} or {}
    (x1 = 0), (x2 = x === undefined ? x3 : x);
  } else if (x1 === undefined) {
    // {x, x2} or {x2}
    x1 = x === undefined ? 0 : x;
  } else if (x2 === undefined) {
    // {x, x1} or {x1}
    x2 = x === undefined ? 0 : x;
  }
  return [x1, x2];
}

// For marks that have x and y channels (e.g., cell, dot, line, text).
export function maybeTuple(x, y) {
  return x === undefined && y === undefined ? [first, second] : [x, y];
}

// A helper for extracting the z channel, if it is variable. Used by transforms
// that require series, such as moving average and normalize.
export function maybeZ({z, fill, stroke} = {}) {
  if (z === undefined) [z] = maybeColorChannel(fill);
  if (z === undefined) [z] = maybeColorChannel(stroke);
  return z;
}

// Returns a Uint32Array with elements [0, 1, 2, … data.length - 1].
export function range(data) {
  const n = data.length;
  const r = new Uint32Array(n);
  for (let i = 0; i < n; ++i) r[i] = i;
  return r;
}

// Returns a filtered range of data given the test function.
export function where(data, test) {
  return range(data).filter((i) => test(data[i], i, data));
}

// Returns an array [values[index[0]], values[index[1]], …].
export function take(values, index) {
  return map(index, (i) => values[i]);
}

// Based on InternMap (d3.group).
export function keyof(value) {
  return value !== null && typeof value === "object" ? value.valueOf() : value;
}

export function maybeInput(key, options) {
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

export function column(source) {
  // Defines a column whose values are lazily populated by calling the returned
  // setter. If the given source is labeled, the label is propagated to the
  // returned column definition.
  let value;
  return [
    {
      transform: () => value,
      label: labelof(source)
    },
    (v) => (value = v)
  ];
}

// Like column, but allows the source to be null.
export function maybeColumn(source) {
  return source == null ? [source] : column(source);
}

export function labelof(value, defaultValue) {
  return typeof value === "string" ? value : value && value.label !== undefined ? value.label : defaultValue;
}

// Assuming that both x1 and x2 and lazy columns (per above), this derives a new
// a column that’s the average of the two, and which inherits the column label
// (if any). Both input columns are assumed to be quantitative. If either column
// is temporal, the returned column is also temporal.
export function mid(x1, x2) {
  return {
    transform(data) {
      const X1 = x1.transform(data);
      const X2 = x2.transform(data);
      return isTemporal(X1) || isTemporal(X2)
        ? map(X1, (_, i) => new Date((+X1[i] + +X2[i]) / 2))
        : map(X1, (_, i) => (+X1[i] + +X2[i]) / 2, Float64Array);
    },
    label: x1.label
  };
}

// If interval is not nullish, converts interval shorthand such as a number (for
// multiples) or a time interval name (such as “day”) to a {floor, offset,
// range} object similar to a D3 time interval.
export function maybeInterval(interval, type) {
  if (interval == null) return;
  if (typeof interval === "number") {
    const n = interval;
    return {
      floor: (d) => n * Math.floor(d / n),
      offset: (d) => d + n, // note: no optional step for simplicity
      range: (lo, hi) => rangei(Math.ceil(lo / n), hi / n).map((x) => n * x)
    };
  }
  if (typeof interval === "string") return (type === "time" ? maybeTimeInterval : maybeUtcInterval)(interval);
  if (typeof interval.floor !== "function") throw new Error("invalid interval; missing floor method");
  if (typeof interval.offset !== "function") throw new Error("invalid interval; missing offset method");
  return interval;
}

// Like maybeInterval, but requires a range method too.
export function maybeRangeInterval(interval, type) {
  interval = maybeInterval(interval, type);
  if (interval && typeof interval.range !== "function") throw new Error("invalid interval: missing range method");
  return interval;
}

// Like maybeRangeInterval, but requires a ceil method too.
export function maybeNiceInterval(interval, type) {
  interval = maybeRangeInterval(interval, type);
  if (interval && typeof interval.ceil !== "function") throw new Error("invalid interval: missing ceil method");
  return interval;
}

// This distinguishes between per-dimension options and a standalone value.
export function maybeValue(value) {
  return value === undefined || isOptions(value) ? value : {value};
}

// Coerces the given channel values (if any) to numbers. This is useful when
// values will be interpolated into other code, such as an SVG transform, and
// where we don’t wish to allow unexpected behavior for weird input.
export function numberChannel(source) {
  return source == null
    ? null
    : {
        transform: (data) => valueof(data, source, Float64Array),
        label: labelof(source)
      };
}

export function isTuples(data) {
  if (!isIterable(data)) return false;
  for (const d of data) {
    if (d == null) continue;
    return typeof d === "object" && "0" in d && "1" in d;
  }
}

export function isIterable(value) {
  return value && typeof value[Symbol.iterator] === "function";
}

export function isTextual(values) {
  for (const value of values) {
    if (value == null) continue;
    return typeof value !== "object" || value instanceof Date;
  }
}

export function isOrdinal(values) {
  for (const value of values) {
    if (value == null) continue;
    const type = typeof value;
    return type === "string" || type === "boolean";
  }
}

export function isTemporal(values) {
  for (const value of values) {
    if (value == null) continue;
    return value instanceof Date;
  }
}

// Are these strings that might represent dates? This is stricter than ISO 8601
// because we want to ignore false positives on numbers; for example, the string
// "1192" is more likely to represent a number than a date even though it is
// valid ISO 8601 representing 1192-01-01.
export function isTemporalString(values) {
  for (const value of values) {
    if (value == null) continue;
    return typeof value === "string" && isNaN(value) && isoParse(value);
  }
}

// Are these strings that might represent numbers? This is stricter than
// coercion because we want to ignore false positives on e.g. empty strings.
export function isNumericString(values) {
  for (const value of values) {
    if (value == null) continue;
    if (typeof value !== "string") return false;
    if (!value.trim()) continue;
    return !isNaN(value);
  }
}

export function isNumeric(values) {
  for (const value of values) {
    if (value == null) continue;
    return typeof value === "number";
  }
}

// Returns true if every non-null value in the specified iterable of values
// passes the specified predicate, and there is at least one non-null value;
// returns false if at least one non-null value does not pass the specified
// predicate; otherwise returns undefined (as if all values are null).
export function isEvery(values, is) {
  let every;
  for (const value of values) {
    if (value == null) continue;
    if (!is(value)) return false;
    every = true;
  }
  return every;
}

// Mostly relies on d3-color, with a few extra color keywords. Currently this
// strictly requires that the value be a string; we might want to apply string
// coercion here, though note that d3-color instances would need to support
// valueOf to work correctly with InternMap.
// https://www.w3.org/TR/SVG11/painting.html#SpecifyingPaint
export function isColor(value) {
  if (typeof value !== "string") return false;
  value = value.toLowerCase().trim();
  return (
    value === "none" ||
    value === "currentcolor" ||
    (value.startsWith("url(") && value.endsWith(")")) || // <funciri>, e.g. pattern or gradient
    (value.startsWith("var(") && value.endsWith(")")) || // CSS variable
    color(value) !== null
  );
}

export function isOpacity(value) {
  return typeof value === "number" && ((0 <= value && value <= 1) || isNaN(value));
}

export function isNoneish(value) {
  return value == null || isNone(value);
}

export function isNone(value) {
  return /^\s*none\s*$/i.test(value);
}

export function isRound(value) {
  return /^\s*round\s*$/i.test(value);
}

export function maybeFrameAnchor(value = "middle") {
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
export function orderof(values) {
  if (values == null) return;
  const first = values[0];
  const last = values[values.length - 1];
  return descending(first, last);
}

// Unlike {...defaults, ...options}, this ensures that any undefined (but
// present) properties in options inherit the given default value.
export function inherit(options = {}, ...rest) {
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
export function named(things) {
  console.warn("named iterables are deprecated; please use an object instead");
  const names = new Set();
  return Object.fromEntries(
    Array.from(things, (thing) => {
      const {name} = thing;
      if (name == null) throw new Error("missing name");
      const key = `${name}`;
      if (key === "__proto__") throw new Error(`illegal name: ${key}`);
      if (names.has(key)) throw new Error(`duplicate name: ${key}`);
      names.add(key);
      return [name, thing];
    })
  );
}

export function maybeNamed(things) {
  return isIterable(things) ? named(things) : things;
}
