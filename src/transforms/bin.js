import {bin as binner, extent, thresholdFreedmanDiaconis, thresholdScott, thresholdSturges, utcTickInterval} from "d3";
import {valueof, range, identity, maybeColumn, maybeTuple, maybeColorChannel, maybeValue, mid, labelof, isTemporal, isIterable} from "../options.js";
import {coerceDate, coerceNumber} from "../scales.js";
import {basic} from "./basic.js";
import {hasOutput, maybeEvaluator, maybeGroup, maybeOutput, maybeOutputs, maybeReduce, maybeSort, maybeSubgroup, reduceCount, reduceFirst, reduceIdentity} from "./group.js";
import {maybeInsetX, maybeInsetY} from "./inset.js";
import {maybeInterval} from "./interval.js";

// Group on {z, fill, stroke}, then optionally on y, then bin x.
export function binX(outputs = {y: "count"}, options = {}) {
  ([outputs, options] = mergeOptions(outputs, options));
  const {x, y} = options;
  return binn(maybeBinValue(x, options, identity), null, null, y, outputs, maybeInsetX(options));
}

// Group on {z, fill, stroke}, then optionally on x, then bin y.
export function binY(outputs = {x: "count"}, options = {}) {
  ([outputs, options] = mergeOptions(outputs, options));
  const {x, y} = options;
  return binn(null, maybeBinValue(y, options, identity), x, null, outputs, maybeInsetY(options));
}

// Group on {z, fill, stroke}, then bin on x and y.
export function bin(outputs = {fill: "count"}, options = {}) {
  ([outputs, options] = mergeOptions(outputs, options));
  const {x, y} = maybeBinValueTuple(options);
  return binn(x, y, null, null, outputs, maybeInsetX(maybeInsetY(options)));
}

function maybeDenseInterval(bin, k, options = {}) {
  return options?.interval == null ? options : bin({[k]: options?.reduce === undefined ? reduceFirst : options.reduce, filter: null}, options);
}

export function maybeDenseIntervalX(options) {
  return maybeDenseInterval(binX, "y", options);
}

export function maybeDenseIntervalY(options) {
  return maybeDenseInterval(binY, "x", options);
}

function binn(
  bx, // optionally bin on x (exclusive with gx)
  by, // optionally bin on y (exclusive with gy)
  gx, // optionally group on x (exclusive with bx and gy)
  gy, // optionally group on y (exclusive with by and gx)
  {
    data: reduceData = reduceIdentity,
    filter = reduceCount, // return only non-empty bins by default
    sort,
    reverse,
    ...outputs // output channel definitions
  } = {},
  inputs = {} // input channels and options
) {
  bx = maybeBin(bx);
  by = maybeBin(by);

  // Compute the outputs.
  outputs = maybeOutputs(outputs, inputs);
  reduceData = maybeReduce(reduceData, identity);
  sort = sort == null ? undefined : maybeOutput("sort", sort, inputs);
  filter = filter == null ? undefined : maybeEvaluator("filter", filter, inputs);

  // Don’t group on a channel if an output requires it as an input!
  if (gx != null && hasOutput(outputs, "x", "x1", "x2")) gx = null;
  if (gy != null && hasOutput(outputs, "y", "y1", "y2")) gy = null;

  // Produce x1, x2, y1, and y2 output channels as appropriate (when binning).
  const [BX1, setBX1] = maybeColumn(bx);
  const [BX2, setBX2] = maybeColumn(bx);
  const [BY1, setBY1] = maybeColumn(by);
  const [BY2, setBY2] = maybeColumn(by);

  // Produce x or y output channels as appropriate (when grouping).
  const [k, gk] = gx != null ? [gx, "x"] : gy != null ? [gy, "y"] : [];
  const [GK, setGK] = maybeColumn(k);

  // Greedily materialize the z, fill, and stroke channels (if channels and not
  // constants) so that we can reference them for subdividing groups without
  // computing them more than once. We also want to consume options that should
  // only apply to this transform rather than passing them through to the next.
  const {
    x,
    y,
    z,
    fill,
    stroke,
    x1, x2, // consumed if x is an output
    y1, y2, // consumed if y is an output
    domain, // eslint-disable-line no-unused-vars
    cumulative, // eslint-disable-line no-unused-vars
    thresholds, // eslint-disable-line no-unused-vars
    interval, // eslint-disable-line no-unused-vars
    ...options
  } = inputs;
  const [GZ, setGZ] = maybeColumn(z);
  const [vfill] = maybeColorChannel(fill);
  const [vstroke] = maybeColorChannel(stroke);
  const [GF, setGF] = maybeColumn(vfill);
  const [GS, setGS] = maybeColumn(vstroke);

  return {
    ..."z" in inputs && {z: GZ || z},
    ..."fill" in inputs && {fill: GF || fill},
    ..."stroke" in inputs && {stroke: GS || stroke},
    ...basic(options, (data, facets) => {
      const K = valueof(data, k);
      const Z = valueof(data, z);
      const F = valueof(data, vfill);
      const S = valueof(data, vstroke);
      const G = maybeSubgroup(outputs, {z: Z, fill: F, stroke: S});
      const groupFacets = [];
      const groupData = [];
      const GK = K && setGK([]);
      const GZ = Z && setGZ([]);
      const GF = F && setGF([]);
      const GS = S && setGS([]);
      const BX = bx ? bx(data) : [[,, I => I]];
      const BY = by ? by(data) : [[,, I => I]];
      const BX1 = bx && setBX1([]);
      const BX2 = bx && setBX2([]);
      const BY1 = by && setBY1([]);
      const BY2 = by && setBY2([]);
      let i = 0;
      for (const o of outputs) o.initialize(data);
      if (sort) sort.initialize(data);
      if (filter) filter.initialize(data);
      for (const facet of facets) {
        const groupFacet = [];
        for (const o of outputs) o.scope("facet", facet);
        if (sort) sort.scope("facet", facet);
        if (filter) filter.scope("facet", facet);
        for (const [f, I] of maybeGroup(facet, G)) {
          for (const [k, g] of maybeGroup(I, K)) {
            for (const [x1, x2, fx] of BX) {
              const bb = fx(g);
              for (const [y1, y2, fy] of BY) {
                const extent = {x1, x2, y1, y2};
                const b = fy(bb);
                if (filter && !filter.reduce(b, extent)) continue;
                groupFacet.push(i++);
                groupData.push(reduceData.reduce(b, data, extent));
                if (K) GK.push(k);
                if (Z) GZ.push(G === Z ? f : Z[b[0]]);
                if (F) GF.push(G === F ? f : F[b[0]]);
                if (S) GS.push(G === S ? f : S[b[0]]);
                if (BX1) BX1.push(x1), BX2.push(x2);
                if (BY1) BY1.push(y1), BY2.push(y2);
                for (const o of outputs) o.reduce(b, extent);
                if (sort) sort.reduce(b);
              }
            }
          }
        }
        groupFacets.push(groupFacet);
      }
      maybeSort(groupFacets, sort, reverse);
      return {data: groupData, facets: groupFacets};
    }),
    ...!hasOutput(outputs, "x") && (BX1 ? {x1: BX1, x2: BX2, x: mid(BX1, BX2)} : {x, x1, x2}),
    ...!hasOutput(outputs, "y") && (BY1 ? {y1: BY1, y2: BY2, y: mid(BY1, BY2)} : {y, y1, y2}),
    ...GK && {[gk]: GK},
    ...Object.fromEntries(outputs.map(({name, output}) => [name, output]))
  };
}

// Allow bin options to be specified as part of outputs; merge them into options.
function mergeOptions({cumulative, domain, thresholds, interval, ...outputs}, options) {
  return [outputs, {cumulative, domain, thresholds, interval, ...options}];
}

function maybeBinValue(value, {cumulative, domain, thresholds, interval}, defaultValue) {
  value = {...maybeValue(value)};
  if (value.domain === undefined) value.domain = domain;
  if (value.cumulative === undefined) value.cumulative = cumulative;
  if (value.thresholds === undefined) value.thresholds = thresholds;
  if (value.interval === undefined) value.interval = interval;
  if (value.value === undefined) value.value = defaultValue;
  value.thresholds = maybeThresholds(value.thresholds, value.interval);
  return value;
}

function maybeBinValueTuple(options) {
  let {x, y} = options;
  x = maybeBinValue(x, options);
  y = maybeBinValue(y, options);
  ([x.value, y.value] = maybeTuple(x.value, y.value));
  return {x, y};
}

function maybeBin(options) {
  if (options == null) return;
  const {value, cumulative, domain = extent, thresholds} = options;
  const bin = data => {
    let V = valueof(data, value, Array); // d3.bin prefers Array input
    const bin = binner().value(i => V[i]);
    if (isTemporal(V) || isTimeThresholds(thresholds)) {
      V = V.map(coerceDate);
      let [min, max] = typeof domain === "function" ? domain(V) : domain;
      let t = typeof thresholds === "function" && !isInterval(thresholds) ? thresholds(V, min, max) : thresholds;
      if (typeof t === "number") t = utcTickInterval(min, max, t);
      if (isInterval(t)) {
        if (domain === extent) {
          min = t.floor(min);
          max = t.ceil(new Date(+max + 1));
        }
        t = t.range(min, max);
      }
      bin.thresholds(t).domain([min, max]);
    } else {
      V = V.map(coerceNumber);
      let d = domain;
      let t = thresholds;
      if (isInterval(t)) {
        let [min, max] = typeof d === "function" ? d(V) : d;
        if (d === extent) {
          min = t.floor(min);
          max = t.offset(t.floor(max));
          d = [min, max];
        }
        t = t.range(min, max);
      }
      bin.thresholds(t).domain(d);
    }
    let bins = bin(range(data)).map(binset);
    if (cumulative) bins = (cumulative < 0 ? bins.reverse() : bins).map(bincumset);
    return bins.map(binfilter);
  };
  bin.label = labelof(value);
  return bin;
}

function maybeThresholds(thresholds, interval) {
  if (thresholds === undefined) {
    return interval === undefined ? thresholdAuto : maybeRangeInterval(interval);
  }
  if (typeof thresholds === "string") {
    switch (thresholds.toLowerCase()) {
      case "freedman-diaconis": return thresholdFreedmanDiaconis;
      case "scott": return thresholdScott;
      case "sturges": return thresholdSturges;
      case "auto": return thresholdAuto;
    }
    throw new Error(`invalid thresholds: ${thresholds}`);
  }
  return thresholds; // pass array, count, or function to bin.thresholds
}

// Unlike the interval transform, we require a range method, too.
function maybeRangeInterval(interval) {
  interval = maybeInterval(interval);
  if (!isInterval(interval)) throw new Error(`invalid interval: ${interval}`);
  return interval;
}

function thresholdAuto(values, min, max) {
  return Math.min(200, thresholdScott(values, min, max));
}

function isTimeThresholds(t) {
  return isTimeInterval(t) || (isIterable(t) && isTemporal(t));
}

function isTimeInterval(t) {
  return isInterval(t) && typeof t === "function" && t() instanceof Date;
}

function isInterval(t) {
  return t ? typeof t.range === "function" : false;
}

function binset(bin) {
  return [bin, new Set(bin)];
}

function bincumset([bin], j, bins) {
  return [
    bin,
    {
      get size() {
        for (let k = 0; k <= j; ++k) {
          if (bins[k][1].size) {
            return 1; // a non-empty value
          }
        }
        return 0;
      },
      has(i) {
        for (let k = 0; k <= j; ++k) {
          if (bins[k][1].has(i)) {
            return true;
          }
        }
        return false;
      }
    }
  ];
}

function binfilter([{x0, x1}, set]) {
  return [x0, x1, set.size ? I => I.filter(set.has, set) : binempty];
}

function binempty() {
  return new Uint32Array(0);
}
