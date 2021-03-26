import {bin as binner} from "d3";
import {firstof} from "../defined.js";
import {valueof, range, identity, maybeLazyChannel, maybeTransform, maybeTuple, maybeColor, maybeValue, mid, labelof} from "../mark.js";
import {offset} from "../style.js";
import {maybeGroup, maybeGroupOutputs, reduceIdentity} from "./group.js";

// Group on {z, fill, stroke}, then optionally on y, then bin x.
export function binX(outputs, {inset, insetLeft, insetRight, ...options} = {}) {
  let {x, y} = options;
  x = maybeBinValue(x, options, identity);
  ([insetLeft, insetRight] = maybeInset(inset, insetLeft, insetRight));
  return binn(x, null, null, y, outputs, {inset, insetLeft, insetRight, ...options});
}

// Group on {z, fill, stroke}, then optionally on y, then bin x.
export function binXMid(outputs, options = {}) {
  let {x, y} = options;
  x = maybeBinValue(x, options, identity);
  const {x1, x2, ...transform} = binn(x, null, null, y, outputs, options);
  return {...transform, x: mid(x1, x2)};
}

// Group on {z, fill, stroke}, then optionally on x, then bin y.
export function binY(outputs, {inset, insetTop, insetBottom, ...options} = {}) {
  let {x, y} = options;
  y = maybeBinValue(y, options, identity);
  ([insetTop, insetBottom] = maybeInset(inset, insetTop, insetBottom));
  return binn(null, y, x, null, outputs, {inset, insetTop, insetBottom, ...options});
}

// Group on {z, fill, stroke}, then optionally on x, then bin y.
export function binYMid(outputs, options = {}) {
  let {x, y} = options;
  y = maybeBinValue(y, options, identity);
  const {y1, y2, ...transform} = binn(null, x, y, null, outputs, options);
  return {...transform, y: mid(y1, y2)};
}

// Group on {z, fill, stroke}, then bin on x and y.
export function bin(outputs, {inset, insetTop, insetRight, insetBottom, insetLeft, ...options} = {}) {
  const {x, y} = maybeBinValueTuple(options);
  ([insetTop, insetBottom] = maybeInset(inset, insetTop, insetBottom));
  ([insetLeft, insetRight] = maybeInset(inset, insetLeft, insetRight));
  return binn(x, y, null, null, outputs, {inset, insetTop, insetRight, insetBottom, insetLeft, ...options});
}

// Group on {z, fill, stroke}, then bin on x and y.
export function binMid(outputs, options) {
  const {x, y} = maybeBinValueTuple(options);
  const {x1, x2, y1, y2, ...transform} = binn(x, y, null, null, outputs, options);
  return {...transform, x: mid(x1, x2), y: mid(y1, y2)};
}

function binn(
  bx, // optionally bin on x (exclusive with gx)
  by, // optionally bin on y (exclusive with gy)
  gx, // optionally group on x (exclusive with bx and gy)
  gy, // optionally group on y (exclusive with by and gx)
  {data: reduceData = reduceIdentity, ...outputs} = {}, // output channel definitions
  inputs = {} // input channels and options
) {
  bx = maybeBin(bx);
  by = maybeBin(by);
  outputs = maybeGroupOutputs(outputs, inputs);

  // Produce x1, x2, y1, and y2 output channels as appropriate (when binning).
  const [BX1, setBX1] = maybeLazyChannel(bx);
  const [BX2, setBX2] = maybeLazyChannel(bx);
  const [BY1, setBY1] = maybeLazyChannel(by);
  const [BY2, setBY2] = maybeLazyChannel(by);

  // Produce x or y output channels as appropriate (when grouping).
  const [k, gk] = gx != null ? [gx, "x"] : gy != null ? [gy, "y"] : [];
  const [GK, setGK] = maybeLazyChannel(k);

  // Greedily materialize the z, fill, and stroke channels (if channels and not
  // constants) so that we can reference them for subdividing groups without
  // computing them more than once.
  const {z, fill, stroke, ...options} = inputs;
  const [GZ, setGZ] = maybeLazyChannel(z);
  const [vfill] = maybeColor(fill);
  const [vstroke] = maybeColor(stroke);
  const [GF = fill, setGF] = maybeLazyChannel(vfill);
  const [GS = stroke, setGS] = maybeLazyChannel(vstroke);

  return {
    z: GZ,
    fill: GF,
    stroke: GS,
    ...options,
    ...GK && {[gk]: GK},
    ...BX1 && {x1: BX1, x2: BX2},
    ...BY1 && {y1: BY1, y2: BY2},
    ...Object.fromEntries(outputs.map(({name, output}) => [name, output])),
    transform: maybeTransform(options, (data, facets) => {
      const K = valueof(data, k);
      const Z = valueof(data, z);
      const F = valueof(data, vfill);
      const S = valueof(data, vstroke);
      const G = firstof(Z, F, S);
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
      for (const facet of facets) {
        const groupFacet = [];
        for (const o of outputs) o.scope("facet", facet);
        for (const [, I] of maybeGroup(facet, G)) {
          for (const o of outputs) o.scope("z", I);
          for (const [k, g] of maybeGroup(I, K)) {
            for (const [x1, x2, fx] of BX) {
              const bb = fx(g);
              if (bb.length === 0) continue;
              for (const [y1, y2, fy] of BY) {
                const b = fy(bb);
                if (b.length === 0) continue;
                groupFacet.push(i++);
                groupData.push(reduceData.reduce(b, data));
                if (K) GK.push(k);
                if (Z) GZ.push(Z[b[0]]);
                if (F) GF.push(F[b[0]]);
                if (S) GS.push(S[b[0]]);
                if (BX1) BX1.push(x1), BX2.push(x2);
                if (BY1) BY1.push(y1), BY2.push(y2);
                for (const o of outputs) o.reduce(b);
              }
            }
          }
        }
        groupFacets.push(groupFacet);
      }
      return {data: groupData, facets: groupFacets};
    })
  };
}

function maybeBinValue(value, {cumulative, domain, thresholds} = {}, defaultValue) {
  value = {...maybeValue(value)};
  if (value.domain === undefined) value.domain = domain;
  if (value.cumulative === undefined) value.cumulative = cumulative;
  if (value.thresholds === undefined) value.thresholds = thresholds;
  if (value.value === undefined) value.value = defaultValue;
  return value;
}

function maybeBinValueTuple(options = {}) {
  let {x, y} = options;
  x = maybeBinValue(x, options);
  y = maybeBinValue(y, options);
  ([x.value, y.value] = maybeTuple(x.value, y.value));
  return {x, y};
}

function maybeBin(options) {
  if (options == null) return;
  const {value, cumulative, domain, thresholds} = options;
  const bin = data => {
    const V = valueof(data, value);
    const bin = binner().value(i => V[i]);
    if (domain !== undefined) bin.domain(domain);
    if (thresholds !== undefined) bin.thresholds(thresholds);
    let bins = bin.value(i => V[i])(range(data)).map(binset);
    if (cumulative) {
      if (cumulative < 0) bins.reverse();
      bins = bins.map(bincumset);
    }
    return bins.filter(nonempty2).map(binfilter);
  };
  bin.label = labelof(value);
  return bin;
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
  return [x0, x1, I => I.filter(set.has, set)]; // TODO optimize
}

function nonempty2([, {size}]) {
  return size > 0;
}

function maybeInset(inset, inset1, inset2) {
  return inset === undefined && inset1 === undefined && inset2 === undefined
    ? (offset ? [1, 0] : [0.5, 0.5])
    : [inset1, inset2];
}
