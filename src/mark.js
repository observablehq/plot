import {sort} from "d3-array";
import {color} from "d3-color";
import {nonempty} from "./defined.js";

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray
const TypedArray = Object.getPrototypeOf(Uint8Array);

export class Mark {
  constructor(data, channels = [], transform = identity) {
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
    let index, data;
    if (this.data !== undefined) {
      if (this.transform === identity) { // optimized common case
        data = this.data, index = facets !== undefined ? facets : range(data);
      } else if (this.transform.length === 2) { // facet-aware transform
        ({index, data} = this.transform(this.data, facets));
        data = arrayify(data);
      } else if (facets !== undefined) { // basic transform, faceted
        // Apply the transform to each facet’s data separately; since the
        // transformed data can have different cardinality than the source
        // data, also build up a new faceted index into the transformed data.
        // Note that the transformed data must be a generic Array, not a typed
        // array, for the array.flat() call to flatten the array.
        let k = 0;
        index = [], data = [];
        for (const facet of facets) {
          const facetData = arrayify(this.transform(take(this.data, facet)), Array);
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
            if (facetIndex === undefined) facetIndex = facets.flat();
            channel.value = take(arrayify(value), facetIndex);
          }
        }
      } else { // basic transform, non-faceted
        data = arrayify(this.transform(this.data));
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

// Returns a Uint32Array with elements [k, k + 1, … k + data.length - 1].
export function offsetRange(data, k) {
  k = Math.floor(k);
  return Uint32Array.from(data, (_, i) => i + k);
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
