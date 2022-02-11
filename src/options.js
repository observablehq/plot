import {parse as isoParse} from "isoformat";
import {color, descending} from "d3";
import {symbolAsterisk, symbolDiamond2, symbolPlus, symbolSquare2, symbolTriangle2, symbolX as symbolTimes} from "d3";
import {symbolCircle, symbolCross, symbolDiamond, symbolSquare, symbolStar, symbolTriangle, symbolWye} from "d3";

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray
const TypedArray = Object.getPrototypeOf(Uint8Array);
const objectToString = Object.prototype.toString;

// This allows transforms to behave equivalently to channels.
export function valueof(data, value, arrayType) {
  const array = arrayType === undefined ? Array : arrayType;
  const type = typeof value;
  return type === "string" ? array.from(data, field(value))
    : type === "function" ? array.from(data, value)
    : type === "number" || value instanceof Date || type === "boolean" ? array.from(data, constant(value))
    : value && typeof value.transform === "function" ? arrayify(value.transform(data), arrayType)
    : arrayify(value, arrayType); // preserve undefined type
}

export const field = name => d => d[name];
export const indexOf = (d, i) => i;
export const identity = {transform: d => d};
export const zero = () => 0;
export const string = x => x == null ? x : `${x}`;
export const number = x => x == null ? x : +x;
export const boolean = x => x == null ? x : !!x;
export const first = x => x ? x[0] : undefined;
export const second = x => x ? x[1] : undefined;
export const constant = x => () => x;

// Some channels may allow a string constant to be specified; to differentiate
// string constants (e.g., "red") from named fields (e.g., "date"), this
// function tests whether the given value is a CSS color string and returns a
// tuple [channel, constant] where one of the two is undefined, and the other is
// the given value. If you wish to reference a named field that is also a valid
// CSS color, use an accessor (d => d.red) instead.
export function maybeColorChannel(value, defaultValue) {
  if (value === undefined) value = defaultValue;
  return value === null ? [undefined, "none"]
    : isColor(value) ? [undefined, value]
    : [value, undefined];
}

// Similar to maybeColorChannel, this tests whether the given value is a number
// indicating a constant, and otherwise assumes that it’s a channel value.
export function maybeNumberChannel(value, defaultValue) {
  if (value === undefined) value = defaultValue;
  return value === null || typeof value === "number" ? [undefined, value]
    : [value, undefined];
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

// Promotes the specified data to an array or typed array as needed. If an array
// type is provided (e.g., Array), then the returned array will strictly be of
// the specified type; otherwise, any array or typed array may be returned. If
// the specified data is null or undefined, returns the value as-is.
export function arrayify(data, type) {
  return data == null ? data : (type === undefined
    ? (data instanceof Array || data instanceof TypedArray) ? data : Array.from(data)
    : (data instanceof type ? data : type.from(data)));
}

// Disambiguates an options object (e.g., {y: "x2"}) from a primitive value.
export function isObject(option) {
  return option && option.toString === objectToString;
}

// Disambiguates an options object (e.g., {y: "x2"}) from a channel value
// definition expressed as a channel transform (e.g., {transform: …}).
export function isOptions(option) {
  return isObject(option) && typeof option.transform !== "function";
}

// For marks specified either as [0, x] or [x1, x2], such as areas and bars.
export function maybeZero(x, x1, x2, x3 = identity) {
  if (x1 === undefined && x2 === undefined) { // {x} or {}
    x1 = 0, x2 = x === undefined ? x3 : x;
  } else if (x1 === undefined) { // {x, x2} or {x2}
    x1 = x === undefined ? 0 : x;
  } else if (x2 === undefined) { // {x, x1} or {x1}
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
  if (z === undefined) ([z] = maybeColorChannel(fill));
  if (z === undefined) ([z] = maybeColorChannel(stroke));
  return z;
}

// Returns a Uint32Array with elements [0, 1, 2, … data.length - 1].
export function range(data) {
  return Uint32Array.from(data, indexOf);
}

// Returns a filtered range of data given the test function.
export function where(data, test) {
  return range(data).filter(i => test(data[i], i, data));
}

// Returns an array [values[index[0]], values[index[1]], …].
export function take(values, index) {
  return Array.from(index, i => values[i]);
}

export function maybeInput(key, options) {
  if (options[key] !== undefined) return options[key];
  switch (key) {
    case "x1": case "x2": key = "x"; break;
    case "y1": case "y2": key = "y"; break;
  }
  return options[key];
}

// Defines a channel whose values are lazily populated by calling the returned
// setter. If the given source is labeled, the label is propagated to the
// returned channel definition.
export function lazyChannel(source) {
  let value;
  return [
    {
      transform: () => value,
      label: labelof(source)
    },
    v => value = v
  ];
}

export function labelof(value, defaultValue) {
  return typeof value === "string" ? value
    : value && value.label !== undefined ? value.label
    : defaultValue;
}

// Like lazyChannel, but allows the source to be null.
export function maybeLazyChannel(source) {
  return source == null ? [source] : lazyChannel(source);
}

// Assuming that both x1 and x2 and lazy channels (per above), this derives a
// new a channel that’s the average of the two, and which inherits the channel
// label (if any). Both input channels are assumed to be quantitative. If either
// channel is temporal, the returned channel is also temporal.
export function mid(x1, x2) {
  return {
    transform(data) {
      const X1 = x1.transform(data);
      const X2 = x2.transform(data);
      return isTemporal(X1) || isTemporal(X2)
        ? Array.from(X1, (_, i) => new Date((+X1[i] + +X2[i]) / 2))
        : Float64Array.from(X1, (_, i) => (+X1[i] + +X2[i]) / 2);
    },
    label: x1.label
  };
}

// This distinguishes between per-dimension options and a standalone value.
export function maybeValue(value) {
  return value === undefined || isOptions(value) ? value : {value};
}

// Coerces the given channel values (if any) to numbers. This is useful when
// values will be interpolated into other code, such as an SVG transform, and
// where we don’t wish to allow unexpected behavior for weird input.
export function numberChannel(source) {
  return source == null ? null : {
    transform: data => valueof(data, source, Float64Array),
    label: labelof(source)
  };
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
    if (value == null || value === "") continue;
    return typeof value === "string" && !isNaN(value);
  }
}

export function isNumeric(values) {
  for (const value of values) {
    if (value == null) continue;
    return typeof value === "number";
  }
}

export function isFirst(values, is) {
  for (const value of values) {
    if (value == null) continue;
    return is(value);
  }
}

// Whereas isFirst only tests the first defined value and returns undefined for
// an empty array, this tests all defined values and only returns true if all of
// them are valid colors. It also returns true for an empty array, and thus
// should generally be used in conjunction with isFirst.
export function isEvery(values, is) {
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
export function isColor(value) {
  if (typeof value !== "string") return false;
  value = value.toLowerCase().trim();
  return value === "none"
    || value === "currentcolor"
    || (value.startsWith("url(") && value.endsWith(")")) // <funciri>, e.g. pattern or gradient
    || color(value) !== null;
}

const symbols = new Map([
  ["asterisk", symbolAsterisk],
  ["circle", symbolCircle],
  ["cross", symbolCross],
  ["diamond", symbolDiamond],
  ["diamond2", symbolDiamond2],
  ["plus", symbolPlus],
  ["square", symbolSquare],
  ["square2", symbolSquare2],
  ["star", symbolStar],
  ["times", symbolTimes],
  ["triangle", symbolTriangle],
  ["triangle2", symbolTriangle2],
  ["wye", symbolWye]
]);

function isSymbolObject(value) {
  return value && typeof value.draw === "function";
}

export function isSymbol(value) {
  if (isSymbolObject(value)) return true;
  if (typeof value !== "string") return false;
  return symbols.has(value.toLowerCase());
}

export function maybeSymbol(symbol) {
  if (symbol == null || isSymbolObject(symbol)) return symbol;
  const value = symbols.get(`${symbol}`.toLowerCase());
  if (value) return value;
  throw new Error(`invalid symbol: ${symbol}`);
}

export function maybeSymbolChannel(symbol) {
  if (symbol == null || isSymbolObject(symbol)) return [undefined, symbol];
  if (typeof symbol === "string") {
    const value = symbols.get(`${symbol}`.toLowerCase());
    if (value) return [undefined, value];
  }
  return [symbol, undefined];
}

export function maybeFrameAnchor(value = "middle") {
  return keyword(value, "frameAnchor", ["middle", "top-left", "top", "top-right", "right", "bottom-right", "bottom", "bottom-left", "left"]);
}

// Like a sort comparator, returns a positive value if the given array of values
// is in ascending order, a negative value if the values are in descending
// order. Assumes monotonicity; only tests the first and last values.
export function order(values) {
  if (values == null) return;
  const first = values[0];
  const last = values[values.length - 1];
  return descending(first, last);
}
