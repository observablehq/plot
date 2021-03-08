import {sort} from "d3-array";
import {color} from "d3-color";
import {nonempty} from "./defined.js";

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray
const TypedArray = Object.getPrototypeOf(Uint8Array);
const objectToString = Object.prototype.toString;

export class Mark {
  constructor(data, channels = [], transform) {
    if (transform == null) transform = undefined;
    const names = new Set();
    this.data = arrayify(data);
    this.transform = transform;
    this.channels = channels.filter(channel => {
      const {name, value, optional} = channel;
      if (value == null) {
        if (optional) return false;
        throw new Error(`missing channel value: ${name}`);
      }
      if (typeof value === "string") {
        channel.value = field(value);
      }
      if (name !== undefined) {
        const key = name + "";
        if (key === "__proto__") throw new Error("illegal channel name");
        if (names.has(key)) throw new Error(`duplicate channel: ${key}`);
        names.add(key);
      }
      return true;
    });
  }
  initialize(facets) {
    let data = this.data;
    let index = facets === undefined && data != null ? range(data) : facets;
    if (data !== undefined && this.transform !== undefined) {
      if (facets === undefined) index = index.length ? [index] : [];
      ({index, data} = this.transform(data, index));
      data = arrayify(data);
      if (facets === undefined && index.length) ([index] = index);
    }
    return {
      index,
      channels: this.channels.map(channel => {
        const {name} = channel;
        return [name == null ? undefined : name + "", Channel(data, channel)];
      })
    };
  }
}

// TODO Type coercion?
function Channel(data, {scale, type, value}) {
  return {
    scale,
    type,
    value: valueof(data, value),
    label: value ? value.label : undefined
  };
}

// This allows transforms to behave equivalently to channels.
export function valueof(data, value, type) {
  const array = type === undefined ? Array : type;
  return typeof value === "string" ? array.from(data, field(value))
    : typeof value === "function" ? array.from(data, value)
    : value && typeof value.transform === "function" ? arrayify(value.transform(data), type)
    : arrayify(value, type); // preserve undefined type
}

export const field = label => Object.assign(d => d[label], {label});
export const indexOf = (d, i) => i;
export const identity = d => d;
export const zero = () => 0;
export const string = x => x == null ? undefined : x + "";
export const number = x => x == null ? undefined : +x;
export const first = d => d[0];
export const second = d => d[1];

// A few extra color keywords not known to d3-color.
const colors = new Set(["currentColor", "none"]);

// Some channels may allow a string constant to be specified; to differentiate
// string constants (e.g., "red") from named fields (e.g., "date"), this
// function tests whether the given value is a CSS color string and returns a
// tuple [channel, constant] where one of the two is undefined, and the other is
// the given value. If you wish to reference a named field that is also a valid
// CSS color, use an accessor (d => d.red) instead.
export function maybeColor(value, defaultValue) {
  if (value === undefined) value = defaultValue;
  return value === null ? [undefined, "none"]
    : typeof value === "string" && (colors.has(value) || color(value)) ? [undefined, value]
    : [value, undefined];
}

// Similar to maybeColor, this tests whether the given value is a number
// indicating a constant, and otherwise assumes that it’s a channel value.
export function maybeNumber(value, defaultValue) {
  if (value === undefined) value = defaultValue;
  return value === null || typeof value === "number" ? [undefined, value]
    : [value, undefined];
}

// If the channel value is specified as a string, indicating a named field, this
// wraps the specified function f with another function with the corresponding
// label property, such that the associated axis inherits the label by default.
export function maybeLabel(f, value) {
  const label = typeof value === "string" ? value
    : typeof value === "function" ? value.label
    : undefined;
  return label === undefined ? f : Object.assign(d => f(d), {label});
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

// For marks specified either as [0, x] or [x1, x2], such as areas and bars.
export function maybeZero(x, x1, x2, x3 = identity) {
  if (x1 === undefined && x2 === undefined) { // {x} or {}
    x1 = zero, x2 = x === undefined ? x3 : x;
  } else if (x1 === undefined) { // {x, x2} or {x2}
    x1 = x === undefined ? zero : x;
  } else if (x2 === undefined) { // {x, x1} or {x1}
    x2 = x === undefined ? zero : x;
  }
  return [x1, x2];
}

// If a sort order is specified, returns a corresponding transform.
// TODO Allow the sort order to be specified as an array.
export function maybeSort(order) {
  if (order !== undefined) {
    if (typeof order !== "function") order = field(order);
    return data => sort(data, order);
  }
}

// A helper for extracting the z channel, if it is variable. Used by transforms
// that require series, such as moving average and normalize.
export function maybeZ({z, fill, stroke} = {}) {
  if (z === undefined) ([z] = maybeColor(fill));
  if (z === undefined) ([z] = maybeColor(stroke));
  return z;
}

// Applies the specified titles via selection.call.
export function title(L) {
  return L ? selection => selection
    .filter(i => nonempty(L[i]))
    .append("title")
      .text(i => L[i]) : () => {};
}

// title for groups (lines, areas).
export function titleGroup(L) {
  return L ? selection => selection
    .filter(([i]) => nonempty(L[i]))
    .append("title")
      .text(([i]) => L[i]) : () => {};
}

// Returns a Uint32Array with elements [0, 1, 2, … data.length - 1].
export function range(data) {
  return Uint32Array.from(data, indexOf);
}

// Returns an array [values[index[0]], values[index[1]], …].
export function take(values, index) {
  return Array.from(index, i => values[i]);
}

// Defines a channel whose values are lazily populated by calling the returned
// setter. If the given source is labeled, the label is propagated to the
// returned channel definition.
export function lazyChannel(source) {
  let value;
  return [
    {
      transform: () => value,
      label: typeof source === "string" ? source
        : source ? source.label
        : undefined
    },
    v => value = v
  ];
}

// Like lazyChannel, but allows the source to be null.
export function maybeLazyChannel(source) {
  return source == null ? [] : lazyChannel(source);
}

// If both t1 and t2 are defined, returns a composite transform that first
// applies t1 and then applies t2.
export function maybeTransform({transform: t1} = {}, t2) {
  if (t1 === undefined) return t2;
  if (t2 === undefined) return t1;
  return (data, index) => {
    ({data, index} = t1(data, index));
    return t2(arrayify(data), index);
  };
}

// Assuming that both x1 and x2 and lazy channels (per above), this derives a
// new a channel that’s the average of the two, and which inherits the channel
// label (if any).
export function mid(x1, x2) {
  return {
    transform(data) {
      const X1 = x1.transform(data);
      const X2 = x2.transform(data);
      return Float64Array.from(X1, (_, i) => (X1[i] + X2[i]) / 2);
    },
    label: x1.label
  };
}

// This distinguishes between per-dimension options and a standalone value.
export function maybeValue(value) {
  return typeof value === "undefined" || (value && value.toString === objectToString) ? value : {value};
}
