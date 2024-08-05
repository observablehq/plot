import {quantile, range as rangei} from "d3";
import {parse as isoParse} from "isoformat";
import {defined} from "./defined.js";
import {timeInterval, utcInterval} from "./time.js";

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray
export const TypedArray = Object.getPrototypeOf(Uint8Array);
const objectToString = Object.prototype.toString;

export function isArray(value) {
  return value instanceof Array || value instanceof TypedArray;
}

function isNumberArray(value) {
  return value instanceof TypedArray && !isBigIntArray(value);
}

function isNumberType(type) {
  return type?.prototype instanceof TypedArray && !isBigIntType(type);
}

function isBigIntArray(value) {
  return value instanceof BigInt64Array || value instanceof BigUint64Array;
}

function isBigIntType(type) {
  return type === BigInt64Array || type === BigUint64Array;
}

// If a reindex is attached to the data, channel values expressed as arrays will
// be reindexed when the channels are instantiated. See exclusiveFacets.
export const reindex = Symbol("reindex");

export function valueof(data, value, type) {
  const valueType = typeof value;
  return valueType === "string"
    ? isArrowTable(data)
      ? maybeTypedArrowify(data.getChild(value), type)
      : maybeTypedMap(data, field(value), type)
    : valueType === "function"
    ? maybeTypedMap(data, value, type)
    : valueType === "number" || value instanceof Date || valueType === "boolean"
    ? map(data, constant(value), type)
    : typeof value?.transform === "function"
    ? maybeTypedArrayify(value.transform(data), type)
    : maybeTake(maybeTypedArrayify(value, type), data?.[reindex]);
}

function maybeTake(values, index) {
  return values != null && index ? take(values, index) : values;
}

function maybeTypedMap(data, f, type) {
  return map(data, isNumberType(type) ? (d, i) => coerceNumber(f(d, i)) : f, type); // allow conversion from BigInt
}

function maybeTypedArrayify(data, type) {
  return type === undefined
    ? arrayify(data) // preserve undefined type
    : isArrowVector(data)
    ? maybeTypedArrowify(data, type)
    : data instanceof type
    ? data
    : type.from(data, isNumberType(type) && !isNumberArray(data) ? coerceNumber : undefined);
}

function maybeTypedArrowify(vector, type) {
  return vector == null
    ? vector
    : (type === undefined || type === Array) && isArrowDateType(vector.type)
    ? coerceDates(vector.toArray())
    : maybeTypedArrayify(vector.toArray(), type);
}

export const singleton = [null]; // for data-less decoration marks, e.g. frame
export const field = (name) => (d) => { const v = d[name]; return v === undefined && d.type === "Feature" ? d.properties?.[name] : v; }; // prettier-ignore
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
  return isNumberArray(values) ? values : map(values, coerceNumber, Float64Array);
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
    : x == null || isNaN((x = Number(x))) // allow conversion from BigInt
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

// Like arrayify, but also allows data to be an Apache Arrow Table.
export function dataify(data) {
  return isArrowTable(data) ? data : arrayify(data);
}

// Promotes the specified data to an array as needed.
export function arrayify(values) {
  if (values == null || isArray(values)) return values;
  if (isArrowVector(values)) return maybeTypedArrowify(values);
  switch (values.type) {
    case "FeatureCollection":
      return values.features;
    case "GeometryCollection":
      return values.geometries;
    case "Feature":
    case "LineString":
    case "MultiLineString":
    case "MultiPoint":
    case "MultiPolygon":
    case "Point":
    case "Polygon":
    case "Sphere":
      return [values];
  }
  return Array.from(values);
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

// Returns true if any of x, x1, or x2 is not (strictly) undefined.
export function hasX({x, x1, x2}) {
  return x !== undefined || x1 !== undefined || x2 !== undefined;
}

// Returns true if any of y, y1, or y2 is not (strictly) undefined.
export function hasY({y, y1, y2}) {
  return y !== undefined || y1 !== undefined || y2 !== undefined;
}

// Returns true if has x or y, or if interval is not (strictly) undefined.
export function hasXY(options) {
  return hasX(options) || hasY(options) || options.interval !== undefined;
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
// TODO Check typeof option[Symbol.iterator] !== "function"?
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

export function lengthof(data) {
  return isArray(data) ? data.length : data?.numRows;
}

// Returns a Uint32Array with elements [0, 1, 2, … data.length - 1].
export function range(data) {
  const n = lengthof(data);
  const r = new Uint32Array(n);
  for (let i = 0; i < n; ++i) r[i] = i;
  return r;
}

// Returns an array [values[index[0]], values[index[1]], …].
export function take(values, index) {
  return isArray(values) ? map(index, (i) => values[i], values.constructor) : map(index, (i) => values.at(i));
}

// If f does not take exactly one argument, wraps it in a function that uses take.
export function taker(f) {
  return f.length === 1 ? (index, values) => f(take(values, index)) : f;
}

// Uses subarray if available, and otherwise slice.
export function subarray(I, i, j) {
  return I.subarray ? I.subarray(i, j) : I.slice(i, j);
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

// If the scale options declare an interval, applies it to the values V.
export function maybeApplyInterval(V, scale) {
  const t = maybeIntervalTransform(scale?.interval, scale?.type);
  return t ? map(V, t) : V;
}

// Returns the equivalent scale transform for the specified interval option.
export function maybeIntervalTransform(interval, type) {
  const i = maybeInterval(interval, type);
  return i && ((v) => (defined(v) ? i.floor(v) : v));
}

// If interval is not nullish, converts interval shorthand such as a number (for
// multiples) or a time interval name (such as “day”) to a {floor, offset,
// range} object similar to a D3 time interval.
export function maybeInterval(interval, type) {
  if (interval == null) return;
  if (typeof interval === "number") return numberInterval(interval);
  if (typeof interval === "string") return (type === "time" ? timeInterval : utcInterval)(interval);
  if (typeof interval.floor !== "function") throw new Error("invalid interval; missing floor method");
  if (typeof interval.offset !== "function") throw new Error("invalid interval; missing offset method");
  return interval;
}

export function numberInterval(interval) {
  interval = +interval;
  if (0 < interval && interval < 1 && Number.isInteger(1 / interval)) interval = -1 / interval;
  const n = Math.abs(interval);
  return interval < 0
    ? {
        floor: (d) => Math.floor(d * n) / n,
        offset: (d, s = 1) => (d * n + Math.floor(s)) / n,
        range: (lo, hi) => rangei(Math.ceil(lo * n), hi * n).map((x) => x / n)
      }
    : {
        floor: (d) => Math.floor(d / n) * n,
        offset: (d, s = 1) => d + n * Math.floor(s),
        range: (lo, hi) => rangei(Math.ceil(lo / n), hi / n).map((x) => x * n)
      };
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

export function isTimeInterval(t) {
  return isInterval(t) && typeof t?.floor === "function" && t.floor() instanceof Date;
}

export function isInterval(t) {
  return typeof t?.range === "function";
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

const namedColors = new Set("none,currentcolor,transparent,aliceblue,antiquewhite,aqua,aquamarine,azure,beige,bisque,black,blanchedalmond,blue,blueviolet,brown,burlywood,cadetblue,chartreuse,chocolate,coral,cornflowerblue,cornsilk,crimson,cyan,darkblue,darkcyan,darkgoldenrod,darkgray,darkgreen,darkgrey,darkkhaki,darkmagenta,darkolivegreen,darkorange,darkorchid,darkred,darksalmon,darkseagreen,darkslateblue,darkslategray,darkslategrey,darkturquoise,darkviolet,deeppink,deepskyblue,dimgray,dimgrey,dodgerblue,firebrick,floralwhite,forestgreen,fuchsia,gainsboro,ghostwhite,gold,goldenrod,gray,green,greenyellow,grey,honeydew,hotpink,indianred,indigo,ivory,khaki,lavender,lavenderblush,lawngreen,lemonchiffon,lightblue,lightcoral,lightcyan,lightgoldenrodyellow,lightgray,lightgreen,lightgrey,lightpink,lightsalmon,lightseagreen,lightskyblue,lightslategray,lightslategrey,lightsteelblue,lightyellow,lime,limegreen,linen,magenta,maroon,mediumaquamarine,mediumblue,mediumorchid,mediumpurple,mediumseagreen,mediumslateblue,mediumspringgreen,mediumturquoise,mediumvioletred,midnightblue,mintcream,mistyrose,moccasin,navajowhite,navy,oldlace,olive,olivedrab,orange,orangered,orchid,palegoldenrod,palegreen,paleturquoise,palevioletred,papayawhip,peachpuff,peru,pink,plum,powderblue,purple,rebeccapurple,red,rosybrown,royalblue,saddlebrown,salmon,sandybrown,seagreen,seashell,sienna,silver,skyblue,slateblue,slategray,slategrey,snow,springgreen,steelblue,tan,teal,thistle,tomato,turquoise,violet,wheat,white,whitesmoke,yellow".split(",")); // prettier-ignore

// Returns true if value is a valid CSS color string. This is intentionally lax
// because the CSS color spec keeps growing, and we don’t need to parse these
// colors—we just need to disambiguate them from column names.
// https://www.w3.org/TR/SVG11/painting.html#SpecifyingPaint
// https://www.w3.org/TR/css-color-5/
export function isColor(value) {
  if (typeof value !== "string") return false;
  value = value.toLowerCase().trim();
  return (
    /^#[0-9a-f]{3,8}$/.test(value) || // hex rgb, rgba, rrggbb, rrggbbaa
    /^(?:url|var|rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch|color|color-mix)\(.*\)$/.test(value) || // <funciri>, CSS variable, color, etc.
    namedColors.has(value) // currentColor, red, etc.
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

export function maybeAnchor(value, name) {
  return maybeKeyword(value, name, [
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

export function maybeFrameAnchor(value = "middle") {
  return maybeAnchor(value, "frameAnchor");
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

// TODO Accept other types of clips (paths, urls, x, y, other marks…)?
// https://github.com/observablehq/plot/issues/181
export function maybeClip(clip) {
  if (clip === true) clip = "frame";
  else if (clip === false) clip = null;
  else if (clip != null) clip = keyword(clip, "clip", ["frame", "sphere"]);
  return clip;
}

// https://github.com/observablehq/stdlib/blob/746ca2e69135df6178e4f3a17244def35d8d6b20/src/arrow.js#L4C1-L17C1
function isArrowTable(value) {
  return (
    value &&
    typeof value.getChild === "function" &&
    typeof value.toArray === "function" &&
    value.schema &&
    Array.isArray(value.schema.fields)
  );
}

function isArrowVector(value) {
  return value && typeof value.toArray === "function" && value.type;
}

// Apache Arrow now represents dates as numbers. We currently only support
// implicit coercion to JavaScript Date objects when the numbers represent
// milliseconds since Unix epoch.
function isArrowDateType(type) {
  return (
    type &&
    (type.typeId === 8 || // date
      type.typeId === 10) && // timestamp
    type.unit === 1 // millisecond
  );
}
