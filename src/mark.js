import {color} from "d3-color";

export class Mark {
  constructor(data, channels = [], transform = identity) {
    const names = new Set();
    this.data = data;
    this.transform = transform;
    this.channels = channels.filter(channel => {
      const {name, value, optional} = channel;
      if (value === undefined) {
        if (optional) return false;
        throw new Error(`missing channel value: ${name}`);
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
  initialize(data) {
    if (data !== undefined) data = this.transform(data, this.data);
    return {
      index: data === undefined ? undefined : Uint32Array.from(data, indexOf),
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
  if (typeof value === "string") label = value, value = Array.from(data, field(value));
  else if (typeof value === "function") label = value.label, value = Array.from(data, value);
  else if (typeof value.length !== "number") value = Array.from(value);
  return {scale, type, value, label};
}

export const field = value => d => d[value];
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
export function maybeColor(value) {
  return typeof value === "string" && (colors.has(value) || color(value)) ? [undefined, value] : [value, undefined];
}

// Similar to maybeColor, this tests whether the given value is a number
// indicating a constant, and otherwise assumes that it’s a channel value.
export function maybeNumber(value) {
  return typeof value === "number" ? [undefined, value] : [value, undefined];
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
export function maybeLabel(f, label) {
  return typeof label === "string" ? Object.assign(d => f(d), {label}) : f;
}

// Computes the size of the given iterable, hopefully without iterating.
export function size(data) {
  return "length" in data ? data.length
    : "size" in data ? data.size
    : Array.from(data).length;
}
