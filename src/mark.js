import {ascending, descending, rollup, sort} from "d3";
import {color} from "d3";
import {nonempty} from "./defined.js";
import {plot} from "./plot.js";
import {registry} from "./scales/index.js";
import {styles} from "./style.js";
import {basic} from "./transforms/basic.js";
import {maybeReduce} from "./transforms/group.js";

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray
const TypedArray = Object.getPrototypeOf(Uint8Array);
const objectToString = Object.prototype.toString;

export class Mark {
  constructor(data, channels = [], options = {}, defaults) {
    const {facet = "auto", sort, dx, dy} = options;
    const names = new Set();
    this.data = data;
    this.sort = isOptions(sort) ? sort : null;
    this.facet = facet == null || facet === false ? null : keyword(facet === true ? "include" : facet, "facet", ["auto", "include", "exclude"]);
    const {transform} = basic(options);
    this.transform = transform;
    if (defaults !== undefined) channels = styles(this, options, channels, defaults);
    this.channels = channels.filter(channel => {
      const {name, value, optional} = channel;
      if (value == null) {
        if (optional) return false;
        throw new Error(`missing channel value: ${name}`);
      }
      if (name !== undefined) {
        const key = `${name}`;
        if (key === "__proto__") throw new Error("illegal channel name");
        if (names.has(key)) throw new Error(`duplicate channel: ${key}`);
        names.add(key);
      }
      return true;
    });
    this.dx = +dx || 0;
    this.dy = +dy || 0;
  }
  initialize(facets, facetChannels) {
    let data = arrayify(this.data);
    let index = facets === undefined && data != null ? range(data) : facets;
    if (data !== undefined && this.transform !== undefined) {
      if (facets === undefined) index = index.length ? [index] : [];
      ({facets: index, data} = this.transform(data, index));
      data = arrayify(data);
      if (facets === undefined && index.length) ([index] = index);
    }
    const channels = this.channels.map(channel => {
      const {name} = channel;
      return [name == null ? undefined : `${name}`, Channel(data, channel)];
    });
    if (this.sort != null) channelSort(channels, facetChannels, data, this.sort);
    return {index, channels};
  }
  plot({marks = [], ...options} = {}) {
    return plot({...options, marks: [...marks, this]});
  }
}

// TODO Type coercion?
function Channel(data, {scale, type, value}) {
  return {
    scale,
    type,
    value: valueof(data, value),
    label: labelof(value)
  };
}

function channelSort(channels, facetChannels, data, options) {
  const {reverse: defaultReverse, reduce: defaultReduce = true, limit: defaultLimit} = options;
  for (const x in options) {
    if (!registry.has(x)) continue; // ignore unknown scale keys
    const {value: y, reverse = defaultReverse, reduce = defaultReduce, limit = defaultLimit} = maybeValue(options[x]);
    if (reduce == null || reduce === false) continue; // disabled reducer
    const X = channels.find(([, {scale}]) => scale === x) || facetChannels && facetChannels.find(([, {scale}]) => scale === x);
    if (!X) throw new Error(`missing channel for scale: ${x}`);
    const XV = X[1].value;
    const [lo = 0, hi = Infinity] = limit && typeof limit[Symbol.iterator] === "function" ? limit : limit < 0 ? [limit] : [0, limit];
    if (y == null) {
      X[1].domain = () => {
        let domain = XV;
        if (reverse) domain = domain.slice().reverse();
        if (lo !== 0 || hi !== Infinity) domain = domain.slice(lo, hi);
        return domain;
      };
    } else {
      let YV;
      if (y === "data") {
        YV = data;
      } else {
        const Y = channels.find(([name]) => name === y);
        if (!Y) throw new Error(`missing channel: ${y}`);
        YV = Y[1].value;
      }
      const reducer = maybeReduce(reduce === true ? "max" : reduce, YV);
      X[1].domain = () => {
        let domain = rollup(range(XV), I => reducer.reduce(I, YV), i => XV[i]);
        domain = sort(domain, reverse ? descendingGroup : ascendingGroup);
        if (lo !== 0 || hi !== Infinity) domain = domain.slice(lo, hi);
        return domain.map(first);
      };
    }
  }
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

export const field = name => d => d[name];
export const indexOf = (d, i) => i;
export const identity = {transform: d => d};
export const zero = () => 0;
export const string = x => x == null ? x : `${x}`;
export const number = x => x == null ? x : +x;
export const boolean = x => x == null ? x : !!x;
export const first = d => d[0];
export const second = d => d[1];
export const constant = x => () => x;

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

// Disambiguates an options object (e.g., {y: "x2"}) from a channel value
// definition expressed as a channel transform (e.g., {transform: …}).
export function isOptions(option) {
  return option
    && option.toString === objectToString
    && typeof option.transform !== "function";
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

export function numberChannel(source) {
  return {
    transform: data => valueof(data, source, Float64Array),
    label: labelof(source)
  };
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

export function markify(mark) {
  return mark instanceof Mark ? mark : new Render(mark);
}

class Render extends Mark {
  constructor(render) {
    super();
    if (render == null) return;
    if (typeof render !== "function") throw new TypeError("invalid mark");
    this.render = render;
  }
  render() {}
}

export function marks(...marks) {
  marks.plot = Mark.prototype.plot;
  return marks;
}

function ascendingGroup([ak, av], [bk, bv]) {
  return ascending(av, bv) || ascending(ak, bk);
}

function descendingGroup([ak, av], [bk, bv]) {
  return descending(av, bv) || ascending(ak, bk);
}
