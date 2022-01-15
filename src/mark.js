import {ascending, descending, rollup, sort} from "d3";
import {arrayify, first, isOptions, keyword, labelof, maybeValue, range, valueof} from "./options.js";
import {plot} from "./plot.js";
import {registry} from "./scales/index.js";
import {styles} from "./style.js";
import {basic} from "./transforms/basic.js";
import {maybeReduce} from "./transforms/group.js";

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
function Channel(data, {scale, type, value, hint}) {
  return {
    scale,
    type,
    value: valueof(data, value),
    label: labelof(value),
    hint
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
