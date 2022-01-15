// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray
const TypedArray = Object.getPrototypeOf(Uint8Array);
const objectToString = Object.prototype.toString;

export function field(name) {
  return d => d[name];
}

export function constant(value) {
  return () => value;
}

// This allows transforms to behave equivalently to channels.
export function valueof(data, value, type) {
  const array = type === undefined ? Array : type;
  return typeof value === "string" ? array.from(data, field(value))
    : typeof value === "function" ? array.from(data, value)
    : typeof value === "number" || value instanceof Date ? array.from(data, constant(value))
    : value && typeof value.transform === "function" ? arrayify(value.transform(data), type)
    : arrayify(value, type); // preserve undefined type
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
