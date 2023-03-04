import {ascending, descending, InternSet, rollup, sort} from "d3";
import {first, isColor, isEvery, isIterable, isOpacity, labelof, map, maybeValue, range, valueof} from "./options.js";
import {registry} from "./scales/index.js";
import {isSymbol, maybeSymbol} from "./symbols.js";
import {maybeReduce} from "./transforms/group.js";

// TODO Type coercion?
export function Channel(data, {scale, type, value, filter, hint}, name) {
  return inferChannelScale(name, {
    scale,
    type,
    value: valueof(data, value),
    label: labelof(value),
    filter,
    hint
  });
}

export function Channels(channels, data) {
  return Object.fromEntries(Object.entries(channels).map(([name, channel]) => [name, Channel(data, channel, name)]));
}

// TODO Use Float64Array for scales with numeric ranges, e.g. position?
export function valueObject(channels, scales) {
  return Object.fromEntries(
    Object.entries(channels).map(([name, {scale: scaleName, value}]) => {
      const scale = scaleName == null ? null : scales[scaleName];
      return [name, scale == null ? value : map(value, scale)];
    })
  );
}

// If the channel uses the "auto" scale (or equivalently true), infer the scale
// from the channel name and the provided values. For color and symbol channels,
// no scale is applied if the values are literal; however for symbols, we must
// promote symbol names (e.g., "plus") to symbol implementations (symbolPlus).
// Note: mutates channel!
export function inferChannelScale(name, channel) {
  const {scale, value} = channel;
  if (scale === true || scale === "auto") {
    switch (name) {
      case "fill":
      case "stroke":
      case "color":
        channel.scale = scale !== true && isEvery(value, isColor) ? null : "color";
        break;
      case "fillOpacity":
      case "strokeOpacity":
        channel.scale = scale !== true && isEvery(value, isOpacity) ? null : "opacity";
        break;
      case "symbol":
        if (scale !== true && isEvery(value, isSymbol)) {
          channel.scale = null;
          channel.value = map(value, maybeSymbol);
        } else {
          channel.scale = "symbol";
        }
        break;
      default:
        channel.scale = registry.has(name) ? name : null;
        break;
    }
  } else if (scale === false) {
    channel.scale = null;
  } else if (scale != null && !registry.has(scale)) {
    throw new Error(`unknown scale: ${scale}`);
  }
  return channel;
}

// Note: mutates channel.domain! This is set to a function so that it is lazily
// computed; i.e., if the scale’s domain is set explicitly, that takes priority
// over the sort option, and we don’t need to do additional work.
export function channelDomain(channels, facetChannels, data, options) {
  const {reverse: defaultReverse, reduce: defaultReduce = true, limit: defaultLimit} = options;
  for (const x in options) {
    if (!registry.has(x)) continue; // ignore unknown scale keys (including generic options)
    let {value: y, reverse = defaultReverse, reduce = defaultReduce, limit = defaultLimit} = maybeValue(options[x]);
    if (reverse === undefined) reverse = y === "width" || y === "height"; // default to descending for lengths
    if (reduce == null || reduce === false) continue; // disabled reducer
    const X = findScaleChannel(channels, x) || (facetChannels && findScaleChannel(facetChannels, x));
    if (!X) throw new Error(`missing channel for scale: ${x}`);
    const XV = X.value;
    const [lo = 0, hi = Infinity] = isIterable(limit) ? limit : limit < 0 ? [limit] : [0, limit];
    if (y == null) {
      X.domain = () => {
        let domain = Array.from(new InternSet(XV)); // remove any duplicates
        if (reverse) domain = domain.reverse();
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
