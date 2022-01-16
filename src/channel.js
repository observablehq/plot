import {ascending, descending, rollup, sort} from "d3";
import {first, labelof, maybeValue, range, valueof} from "./options.js";
import {registry} from "./scales/index.js";
import {maybeReduce} from "./transforms/group.js";

// TODO Type coercion?
export function Channel(data, {scale, type, value, hint}) {
  return {
    scale,
    type,
    value: valueof(data, value),
    label: labelof(value),
    hint
  };
}

export function channelSort(channels, facetChannels, data, options) {
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

function ascendingGroup([ak, av], [bk, bv]) {
  return ascending(av, bv) || ascending(ak, bk);
}

function descendingGroup([ak, av], [bk, bv]) {
  return descending(av, bv) || ascending(ak, bk);
}
