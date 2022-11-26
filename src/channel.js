import {ascending, descending, rollup, sort} from "d3";
import {first, isIterable, labelof, map, maybeValue, range, valueof} from "./options.js";
import {applyProjection} from "./projection.js";
import {registry} from "./scales/index.js";
import {maybeReduce} from "./transforms/group.js";

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
export function valueObject(channels, scales, {projection}) {
  let x, y; // names of channels bound to x and y scale

  const values = Object.fromEntries(
    Object.entries(channels).map(([name, {scale: scaleName, value}]) => {
      let scale;
      if (scaleName !== undefined) {
        if (scaleName === "x") x = x === undefined ? name : "*";
        else if (scaleName === "y") y = y === undefined ? name : "*";
        scale = scales[scaleName];
      }
      return [name, scale === undefined ? value : map(value, scale)];
    })
  );

  // If there is a projection, and there are both x and y channels, and those x
  // and y channels are associated with the x and y scale respectively (and not
  // already in screen coordinates as with an initializer), then apply the
  // projection, replacing the x and y values. Note that the x and y scales
  // themselves don’t exist if there is a projection, but whether the channels
  // are associated with scales still determines whether the projection should
  // apply; think of the projection as a combination xy-scale.
  if (projection) {
    if (x === "x" && y === "y") {
      applyProjection(values, projection);
    } else if (x || y) {
      throw new Error("projection requires x and y channels");
    }
  }

  return values;
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
