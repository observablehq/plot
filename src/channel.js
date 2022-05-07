import {ascending, descending, rollup, sort} from "d3";
import {first, labelof, map, maybeValue, range, valueof} from "./options.js";
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

export function channelSort(channels, facetChannels, data, options) {
  const {reverse: defaultReverse, reduce: defaultReduce = true, limit: defaultLimit} = options;
  for (const x in options) {
    if (!registry.has(x)) continue; // ignore unknown scale keys
    let {value: y, reverse = defaultReverse, reduce = defaultReduce, limit = defaultLimit} = maybeValue(options[x]);
    if (reverse === undefined) reverse = y === "width" || y === "height"; // default to descending for lengths
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
      const YV = y === "data" ? data
          : y === "height" ? difference(channels, "y1", "y2")
          : y === "width" ? difference(channels, "x1", "x2")
          : values(channels, y, y === "y" ? "y2" : y === "x" ? "x2" : undefined);
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

function difference(channels, k1, k2) {
  const X1 = values(channels, k1);
  const X2 = values(channels, k2);
  return map(X2, (x2, i) => Math.abs(x2 - X1[i]), Float64Array);
}

function values(channels, name, alias) {
  let channel = channels.find(([n]) => n === name);
  if (!channel && alias !== undefined) channel = channels.find(([n]) => n === alias);
  if (channel) return channel[1].value;
  throw new Error(`missing channel: ${name}`);
}

function ascendingGroup([ak, av], [bk, bv]) {
  return ascending(av, bv) || ascending(ak, bk);
}

function descendingGroup([ak, av], [bk, bv]) {
  return descending(av, bv) || ascending(ak, bk);
}
