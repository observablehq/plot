import {ascending, descending, rollup, sort} from "d3";
import {first, isIterable, labelof, map, maybeValue, range, valueof} from "./options.js";
import {scaleRegistry} from "./scales/index.js";
import {maybeReduce} from "./transforms/group.js";
import {maybeColorChannel, maybeNumberChannel} from "./options.js";
import {maybeSymbolChannel} from "./symbols.js";
import {warn} from "./warnings.js";

// An array of known channels, with an associated scale name, and a definition
// that returns [variable, undefined] if variable, or [undefined, constant] if
// constant (such as "#eee" for the color channel)
export const channelRegistry = new Map([
  ["x", {scale: "x"}],
  ["x1", {scale: "x"}],
  ["x2", {scale: "x"}],
  ["y", {scale: "y"}],
  ["y1", {scale: "y"}],
  ["y2", {scale: "y"}],
  ["z", {}],
  ["ariaLabel", {}],
  ["href", {}],
  ["title", {}],
  ["fill", {scale: "color", definition: maybeColorChannel}],
  ["stroke", {scale: "color", definition: maybeColorChannel}],
  ["fillOpacity", {scale: "opacity", definition: maybeNumberChannel}],
  ["strokeOpacity", {scale: "opacity", definition: maybeNumberChannel}],
  ["opacity", {scale: "opacity", definition: maybeNumberChannel}],
  ["strokeWidth", {definition: maybeNumberChannel}],
  ["symbol", {scale: "symbol", definition: maybeSymbolChannel}], // dot
  ["r", {scale: "r", definition: maybeNumberChannel}], // dot
  ["rotate", {definition: maybeNumberChannel}], // dot, text
  ["fontSize", {definition: maybeFontSizeChannel}], // text
  ["text", {}], // text
  ["length", {scale: "length", definition: maybeNumberChannel}], // vector
  ["width", {definition: maybeNumberChannel}], // image
  ["height", {definition: maybeNumberChannel}], // image
  ["src", {definition: maybePathChannel}], // image
  ["weight", {definition: maybeNumberChannel}] // density
]);

export function definition(name, value, defaultValue) {
  if (!channelRegistry.has(name)) {
    warn(`The ${name} channel is not registered and might be incompatible with some transforms.`);
  }
  const {definition} = channelRegistry.get(name) ?? {};
  return definition !== undefined
    ? definition(value, defaultValue)
    : value === undefined
    ? [undefined, defaultValue]
    : [value];
}

// TODO Type coercion?
export function Channel(data, {scale, type, value, filter, hint}) {
  return {
    scale,
    type,
    value: valueof(data, value),
    label: labelof(value),
    filter,
    hint
  };
}

export function Channels(descriptors, data) {
  return Object.fromEntries(
    Object.entries(descriptors).map(([name, channel]) => {
      return [name, Channel(data, channel)];
    })
  );
}

// TODO Use Float64Array for scales with numeric ranges, e.g. position?
export function valueObject(channels, scales) {
  return Object.fromEntries(
    Object.entries(channels).map(([name, {scale: scaleName, value}]) => {
      const scale = scales[scaleName];
      return [name, scale === undefined ? value : map(value, scale)];
    })
  );
}

// Note: mutates channel.domain! This is set to a function so that it is lazily
// computed; i.e., if the scale’s domain is set explicitly, that takes priority
// over the sort option, and we don’t need to do additional work.
export function channelDomain(channels, facetChannels, data, options) {
  const {reverse: defaultReverse, reduce: defaultReduce = true, limit: defaultLimit} = options;
  for (const x in options) {
    if (!scaleRegistry.has(x)) continue; // ignore unknown scale keys (including generic options)
    let {value: y, reverse = defaultReverse, reduce = defaultReduce, limit = defaultLimit} = maybeValue(options[x]);
    if (reverse === undefined) reverse = y === "width" || y === "height"; // default to descending for lengths
    if (reduce == null || reduce === false) continue; // disabled reducer
    const X = findScaleChannel(channels, x) || (facetChannels && findScaleChannel(facetChannels, x));
    if (!X) throw new Error(`missing channel for scale: ${x}`);
    const XV = X.value;
    const [lo = 0, hi = Infinity] = isIterable(limit) ? limit : limit < 0 ? [limit] : [0, limit];
    if (y == null) {
      X.domain = () => {
        let domain = XV;
        if (reverse) domain = domain.slice().reverse();
        if (lo !== 0 || hi !== Infinity) domain = domain.slice(lo, hi);
        return domain;
      };
    } else {
      const YV =
        y === "data"
          ? data
          : y === "height"
          ? difference(channels, "y1", "y2")
          : y === "width"
          ? difference(channels, "x1", "x2")
          : values(channels, y, y === "y" ? "y2" : y === "x" ? "x2" : undefined);
      const reducer = maybeReduce(reduce === true ? "max" : reduce, YV);
      X.domain = () => {
        let domain = rollup(
          range(XV),
          (I) => reducer.reduce(I, YV),
          (i) => XV[i]
        );
        domain = sort(domain, reverse ? descendingGroup : ascendingGroup);
        if (lo !== 0 || hi !== Infinity) domain = domain.slice(lo, hi);
        return domain.map(first);
      };
    }
  }
}

function findScaleChannel(channels, scale) {
  for (const name in channels) {
    const channel = channels[name];
    if (channel.scale === scale) return channel;
  }
}

function difference(channels, k1, k2) {
  const X1 = values(channels, k1);
  const X2 = values(channels, k2);
  return map(X2, (x2, i) => Math.abs(x2 - X1[i]), Float64Array);
}

function values(channels, name, alias) {
  let channel = channels[name];
  if (!channel && alias !== undefined) channel = channels[alias];
  if (channel) return channel.value;
  throw new Error(`missing channel: ${name}`);
}

function ascendingGroup([ak, av], [bk, bv]) {
  return ascending(av, bv) || ascending(ak, bk);
}

function descendingGroup([ak, av], [bk, bv]) {
  return descending(av, bv) || ascending(ak, bk);
}

// https://developer.mozilla.org/en-US/docs/Web/CSS/font-size
const fontSizes = new Set([
  // global keywords
  "inherit",
  "initial",
  "revert",
  "unset",
  // absolute keywords
  "xx-small",
  "x-small",
  "small",
  "medium",
  "large",
  "x-large",
  "xx-large",
  "xxx-large",
  // relative keywords
  "larger",
  "smaller"
]);

// The font size may be expressed as a constant in the following forms:
// - number in pixels
// - string keyword: see above
// - string <length>: e.g., "12px"
// - string <percentage>: e.g., "80%"
// Anything else is assumed to be a channel definition.
export function maybeFontSizeChannel(fontSize) {
  if (fontSize == null || typeof fontSize === "number") return [undefined, fontSize];
  if (typeof fontSize !== "string") return [fontSize, undefined];
  fontSize = fontSize.trim().toLowerCase();
  return fontSizes.has(fontSize) || /^[+-]?\d*\.?\d+(e[+-]?\d+)?(\w*|%)$/.test(fontSize)
    ? [undefined, fontSize]
    : [fontSize, undefined];
}

// Tests if the given string is a path: does it start with a dot-slash
// (./foo.png), dot-dot-slash (../foo.png), or slash (/foo.png)?
function isPath(string) {
  return /^\.*\//.test(string);
}

// Tests if the given string is a URL (e.g., https://placekitten.com/200/300).
// The allowed protocols is overly restrictive, but we don’t want to allow any
// scheme here because it would increase the likelihood of a false positive with
// a field name that happens to contain a colon.
function isUrl(string) {
  return /^(blob|data|file|http|https):/i.test(string);
}

// Disambiguates a constant src definition from a channel. A path or URL string
// is assumed to be a constant; any other string is assumed to be a field name.
export function maybePathChannel(value) {
  return typeof value === "string" && (isPath(value) || isUrl(value)) ? [undefined, value] : [value, undefined];
}
