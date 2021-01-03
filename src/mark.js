import {sort} from "d3-array";
import {color} from "d3-color";
import {nonempty} from "./defined.js";

export class Mark {
  constructor(data, channels = [], transform = identity) {
    const names = new Set();
    this.data = data;
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
    let index, data;
    if (this.data !== undefined) {
      if (this.transform === identity) { // optimized common case
        data = this.data, index = facets !== undefined ? facets : range(data);
      } else if (this.transform.length === 2) { // facet-aware transform
        ({index, data} = this.transform(this.data, facets));
      } else if (facets !== undefined) { // basic transform, faceted
        // Apply the transform to each facet’s data separately; since the
        // transformed data can have different cardinality than the source
        // data, also build up a new faceted index into the transformed data.
        let k = 0;
        index = [], data = [];
        for (const facet of facets) {
          const facetData = this.transform(take(this.data, facet));
          const facetIndex = facetData === undefined ? undefined : offsetRange(facetData, k);
          k += facetData.length;
          index.push(facetIndex);
          data.push(facetData);
        }
        data = data.flat();
        // Reorder any channel value arrays to match the transformed index.
        // Since there may be zero or multiple channels that need reordering,
        // we lazily compute the flattened transformed index.
        let facetIndex;
        for (const channel of this.channels) {
          let {value} = channel;
          if (typeof value !== "function") {
            if (typeof value.length !== "number") value = Array.from(value);
            if (facetIndex === undefined) facetIndex = facets.flat();
            channel.value = take(value, facetIndex);
          }
        }
      } else { // basic transform, non-faceted
        data = this.transform(this.data);
        index = data === undefined ? undefined : range(data);
      }
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
  let label;
  if (typeof value === "function") {
    label = value.label;
    value = Array.from(data, value);
  } else if (typeof value.length !== "number") {
    value = Array.from(value);
  }
  return {scale, type, value, label};
}

// This allows transforms to behave equivalently to channels.
export function valueof(data, value) {
  return typeof value === "string" ? Array.from(data, field(value))
    : typeof value === "function" ? Array.from(data, value)
    : typeof value.length !== "number" ? Array.from(value)
    : value;
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

// The value may be defined as a string or function, rather than an object with
// a value property. TODO Allow value to be specified as array, too? This would
// require promoting the array to an accessor for compatibility with d3.bin.
export function maybeValue(x) {
  return typeof x === "string" || typeof x === "function" ? {value: x} : x;
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

// Computes the size of the given iterable, hopefully without iterating.
export function size(data) {
  return "length" in data ? data.length
    : "size" in data ? data.size
    : Array.from(data).length;
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

// Applies the specified titles via selection.call.
export function title(L) {
  return L ? selection => selection
    .filter(i => nonempty(L[i]))
    .append("title")
      .text(i => L[i]) : () => {};
}

// Returns a Uint32Array with elements [0, 1, 2, … data.length - 1].
export function range(data) {
  return Uint32Array.from(data, indexOf);
}

// Returns a Uint32Array with elements [k, k + 1, … k + data.length - 1].
export function offsetRange(data, k) {
  k = Math.floor(k);
  return Uint32Array.from(data, (_, i) => i + k);
}

// Returns an array [values[index[0]], values[index[1]], …].
export function take(values, index) {
  return Array.from(index, i => values[i]);
}
