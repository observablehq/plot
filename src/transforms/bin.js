import {bin as binner, cross, group} from "d3-array";
import {valueof, first, second, range, offsetRange, identity, maybeLabel, maybeTransform, lazyChannel, maybeLazyChannel, maybeColor, take} from "../mark.js";

export function binX({x, insetLeft = 1, ...options} = {}) {
  const [transform, x1, x2, y, z, fill, stroke] = bin1(x, options);
  return {...options, transform, y, x1, x2, z, fill, stroke, insetLeft};
}

export function binY({y, insetTop = 1, ...options} = {}) {
  const [transform, y1, y2, x, z, fill, stroke] = bin1(y, options);
  return {...options, transform, x, y1, y2, z, fill, stroke, insetTop};
}

export function binR({x, y, ...options} = {}) {
  const [transform, r] = maybeNormalize(options, bin2(x, y, options));
  return {...options, transform, x: maybeLabel(xMid, x), y: maybeLabel(yMid, y), r};
}

export function bin({x, y, insetLeft = 1, insetTop = 1, out, ...options} = {}) {
  const [transform, l] = maybeNormalize(options, bin2(x, y, options));
  return {...options, transform, x1: maybeLabel(x0, x), x2: x1, y1: maybeLabel(y0, y), y2: y1, insetLeft, insetTop, [out]: l};
}

function bin1(x = identity, options = {}) {
  const {z, fill, stroke, domain, thresholds, normalize, cumulative} = options;
  const k = normalize === true ? 100 : +normalize;
  const [vfill] = maybeColor(fill);
  const [vstroke] = maybeColor(stroke);
  const bin = binof({value: x, domain, thresholds});
  const [X1, setX1] = lazyChannel(x);
  const [X2, setX2] = lazyChannel(x);
  const [Y, setY] = lazyChannel(`Frequency${k === 100 ? " (%)" : ""}`);
  const [Z, setZ] = maybeLazyChannel(z);
  const [F = fill, setF] = maybeLazyChannel(vfill);
  const [S = stroke, setS] = maybeLazyChannel(vstroke);
  return [
    maybeTransform(options, (data, index) => {
      const B = bin(data);
      const Z = valueof(data, z);
      const F = valueof(data, vfill);
      const S = valueof(data, vstroke);
      const binIndex = [];
      const binData = [];
      const X1 = setX1([]);
      const X2 = setX2([]);
      const Y = setY([]);
      const G = Z || F || S;
      const BZ = Z && setZ([]);
      const BF = F && setF([]);
      const BS = S && setS([]);
      const n = data.length;
      let i = 0;
      if (cumulative < 0) B.reverse();
      for (const facet of index) {
        const binFacet = [];
        for (const I of G ? group(facet, i => G[i]).values() : [facet]) {
          const set = new Set(I);
          let f;
          for (const b of B) {
            const s = b.filter(i => set.has(i));
            f = cumulative && f !== undefined ? f.concat(s) : s;
            const l = f.length;
            if (l > 0) {
              binFacet.push(i++);
              binData.push(take(data, f));
              X1.push(b.x0);
              X2.push(b.x1);
              Y.push(k ? l * k / n : l);
              if (Z) BZ.push(Z[f[0]]);
              if (F) BF.push(F[f[0]]);
              if (S) BS.push(S[f[0]]);
            }
          }
        }
        binIndex.push(binFacet);
      }
      return {data: binData, index: binIndex};
    }),
    X1,
    X2,
    Y,
    Z,
    F,
    S
  ];
}

// Here x and y may each either be a standalone value (e.g., a string
// representing a field name, a function, an array), or the value and some
// additional per-dimension binning options as an objects of the form {value,
// domain?, thresholds?}.
function bin2(x, y, options = {}) {
  const {domain, thresholds} = options;
  const binX = binof({domain, thresholds, value: first, ...maybeValue(x)});
  const binY = binof({domain, thresholds, value: second, ...maybeValue(y)});
  return rebin(
    data => cross(
      binX(data).filter(nonempty),
      binY(data).filter(nonempty).map(binset2),
      (x, y) => y(x)
    ),
    subset2,
    options
  );
}

function binof({value, domain, thresholds}) {
  return data => {
    const values = valueof(data, value);
    const bin = binner().value(i => values[i]);
    if (domain !== undefined) bin.domain(domain);
    if (thresholds !== undefined) bin.thresholds(thresholds);
    return bin(range(data));
  };
}

// When faceting, subdivides the given bins according to the facet indexes.
// TODO Support a z channel for overlapping bins (that can then be stacked).
function rebin(bin, subset, {cumulative} = {}) {
  return (data, index) => {
    const B = bin(data);
    const binIndex = [];
    const binData = [];
    let k = 0;
    for (const facet of index) {
      let b = B.map(subset(facet));
      if (cumulative) b = accumulate(cumulative < 0 ? b.reverse() : b);
      b = b.filter(nonempty);
      binIndex.push(offsetRange(b, k));
      k = binData.push(...b);
    }
    return {data: binData, index: binIndex};
  };
}

function subset2(I) {
  I = new Set(I);
  return bin => {
    const subbin = bin.filter(i => I.has(i));
    subbin.x0 = bin.x0;
    subbin.x1 = bin.x1;
    subbin.y0 = bin.y0;
    subbin.y1 = bin.y1;
    return subbin;
  };
}

function binset2(biny) {
  const y = new Set(biny);
  const {x0: y0, x1: y1} = biny;
  return binx => {
    const subbin = binx.filter(i => y.has(i));
    subbin.x0 = binx.x0;
    subbin.x1 = binx.x1;
    subbin.y0 = y0;
    subbin.y1 = y1;
    return subbin;
  };
}

function accumulate(bins) {
  let sum = 0;
  return bins.map(({x0, x1, length}) => ({x0, x1, length: sum += length}));
}

function nonempty({length}) {
  return length > 0;
}

function x0(d) {
  return d.x0;
}

function x1(d) {
  return d.x1;
}

function y0(d) {
  return d.y0;
}

function y1(d) {
  return d.y1;
}

function xMid(d) {
  return (d.x0 + d.x1) / 2;
}

function yMid(d) {
  return (d.y0 + d.y1) / 2;
}

function length1({length}) {
  return length;
}

length1.label = "Frequency";

// Returns a channel definition that’s either the number of elements in the
// given bin (length2 above), or the same as a proportion of the total number of
// elements in the data scaled by k. If k is true, it is treated as 100 for
// percentages; otherwise, it is typically 1.
function maybeNormalizeLength1(normalize) {
  const k = normalize === true ? 100 : +normalize;
  if (!k) return [length1];
  let n; // set lazily by the transform
  const value = ({length}) => length * k / n;
  value.label = `Frequency${k === 100 ? " (%)" : ""}`;
  return [value, ({length}) => void (n = length)];
}

// If the bin length requires normalization (per binLength above), this wraps
// the specified transform to allow it.
function maybeNormalize({normalize, ...options} = {}, transform) {
  const [length, normalizeLength] = maybeNormalizeLength1(normalize);
  return [
    maybeTransform(options, normalizeLength
      ? (data, index) => (normalizeLength(data), transform(data, index))
      : transform),
    length
  ];
}

// This distinguishes between per-dimension options and a standalone value.
function maybeValue(value) {
  return typeof value === "object" && value && "value" in value ? value : {value};
}
