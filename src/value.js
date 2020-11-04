import {ascending} from "d3-array";

// A channel value can be expressed in shorthand in several ways: it can be a
// string which represents a named field, which is promoted to an accessor
// function and assigned a default label; it can be an accessor function which
// will be invoked for each element in the input data; or it can be an iterable
// (typically an array) of values. This function disambiguates shorthand values
// from longhand options.
export function isBareValue(value) {
  return ["string", "function"].includes(typeof value) || isBareIterable(value);
}

// Explicit channel values (as opposed to accessor functions) can be expressed
// either as an array, a typed array, or a generic iterable. This function
// should return true for anything you can reasonably pass to Array.from, and
// false for anything else.
export function isBareIterable(value) {
  return value && ("length" in value || typeof value[Symbol.iterator] === "function");
}

// Sometimes channels may be implied; for example, if the x-channel is not
// specified for a line chart, it defaults to the zero-based index of data. This
// returns true if the channel’s value is not defined.
export function isMissing(channel) {
  return !channel || channel.value === undefined;
}

// Returns true if the channel’s value is expressed as a shorthand field. This
// should be applied after normalizing bare values: {x: "foo"} and {x: {value:
// "foo"}} should be equivalent!
export function isField(channel) {
  return channel && typeof channel.value === "string";
}

// Given a channel specified as a shorthand field, promotes the field to an
// accessor function and assigns a default label with an array of x and y.
export function field({value, invert, ...channel}, key) {
  return {
    value: d => d[value],
    label: `${
      key === "y" ? (invert ? "↓ " : "↑ "): ""}${
      value}${
      key === "x" ? (invert ? " ←" : " →"): ""}`,
    invert,
    ...channel
  };
}

// Channel rules may be expressed in shorthand as a single rule.
export function hasRule(channel) {
  return channel && "rule" in channel;
}

// Given an options object name a channel key (such as x or y), returns a
// normalized options object by promoting bare values, implied channels, and
// fields to the longhand representation.
export function channel(options, key, defaults, implied) {
  let channel = options[key];
  if (isBareValue(channel)) channel = {value: channel};
  if (isField(channel)) channel = field(channel, key);
  if (hasRule(channel)) channel = {rules: [channel.rule], ...channel};
  if (implied && isMissing(channel)) defaults = {...defaults, ...implied};
  if (defaults) channel = {...defaults, ...channel};
  return channel;
}

// Given a plot’s input data (possibly null) and a value specification, computes
// the corresponding array of values, if any. The given value must either be
// missing (falsey), an accessor function, or an array of values.
export function inferValues(data, {value}) {
  return typeof value === "function" ? Array.from(data, value) : value;
}

// The identity value accessor.
export function identity(d) {
  return d;
}

// The index value accessor.
export function indexOf(d, i) {
  return i;
}

// Given an array of values, returns an array [0, 1, ... values.length - 1]. The
// specified array must not contain more than 2^31 - 1 values.
export function index(values) {
  return Uint32Array.from(values, indexOf);
}

// Given an array of values, returns an array of zero-based indexes sorted in
// natural ascending order.
export function sortedIndex(values) {
  return index(values).sort((i, j) => ascending(values[i], values[j]));
}
