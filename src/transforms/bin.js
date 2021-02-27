import {bin as binner, cross} from "d3-array";
import {valueof, first, second, maybeValue, range, offsetRange, identity, maybeLabel} from "../mark.js";

export function binX({x = identity, domain, thresholds, normalize, cumulative, ...options} = {}) {
  const y = binLength(normalize);
  return {
    ...options,
    transform: maybeNormalize(bin1({value: x, domain, thresholds, cumulative}), y),
    y,
    x1: maybeLabel(x0, x),
    x2: x1
  };
}

export function binY({y = identity, domain, thresholds, normalize, cumulative, ...options} = {}) {
  const x = binLength(normalize);
  return {
    ...options,
    transform: maybeNormalize(bin1({value: y, domain, thresholds, cumulative}), x),
    x,
    y1: maybeLabel(x0, y),
    y2: x1
  };
}

export function binR({x, y, domain, thresholds, normalize, ...options} = {}) {
  const r = binLength(normalize);
  return {
    ...options,
    transform: maybeNormalize(bin2({x, y, domain, thresholds}), r),
    r,
    x: maybeLabel(xMid, x),
    y: maybeLabel(yMid, y)
  };
}

export function bin({x, y, out, domain, thresholds, normalize, ...options} = {}) {
  const l = binLength(normalize);
  return {
    ...options,
    transform: maybeNormalize(bin2({x, y, domain, thresholds}), l),
    [out]: l,
    x1: maybeLabel(x0, x),
    x2: x1,
    y1: maybeLabel(y0, y),
    y2: y1
  };
}

function bin1(options = {}) {
  let {value, domain, thresholds, cumulative} = maybeValue(options);
  const bin = binof({value, domain, thresholds});
  return (data, facets) => rebin(bin(data), facets, subset1, cumulative);
}

function bin2({x = {}, y = {}, domain, thresholds} = {}) {
  const binX = binof({domain, thresholds, value: first, ...maybeValue(x)});
  const binY = binof({domain, thresholds, value: second, ...maybeValue(y)});
  return (data, facets) => rebin(
    cross(
      binX(data).filter(nonempty),
      binY(data).filter(nonempty).map(binset),
      (x, y) => {
        const subbin = x.filter(i => y.has(i));
        subbin.x0 = x.x0;
        subbin.x1 = x.x1;
        subbin.y0 = y.x0;
        subbin.y1 = y.x1;
        return subbin;
      }
    ),
    facets,
    subset2
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
function rebin(bins, facets, subset, cumulative) {
  if (facets === undefined) {
    if (cumulative) bins = accumulate(cumulative < 0 ? bins.reverse() : bins);
    bins = bins.filter(nonempty);
    return {index: range(bins), data: bins};
  }
  const index = [];
  const data = [];
  let k = 0;
  for (const facet of facets.map(subset)) {
    let b = bins.map(facet);
    if (cumulative) b = accumulate(cumulative < 0 ? b.reverse() : b);
    b = b.filter(nonempty);
    index.push(offsetRange(b, k));
    data.push(b);
    k += b.length;
  }
  return {index, data: data.flat()};
}

function binset(bin) {
  const set = new Set(bin);
  set.x0 = bin.x0;
  set.x1 = bin.x1;
  return set;
}

function subset1(facet) {
  const f = new Set(facet);
  return bin => {
    const subbin = bin.filter(i => f.has(i));
    subbin.x0 = bin.x0;
    subbin.x1 = bin.x1;
    return subbin;
  };
}

function subset2(facet) {
  const f = new Set(facet);
  return bin => {
    const subbin = bin.filter(i => f.has(i));
    subbin.x0 = bin.x0;
    subbin.x1 = bin.x1;
    subbin.y0 = bin.y0;
    subbin.y1 = bin.y1;
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

function length1(d) {
  return d.length;
}

length1.label = "Frequency";

// Returns a channel definition that’s either the number of elements in the
// given bin (length2 above), or the same as a proportion of the total number of
// elements in the data scaled by k. If k is true, it is treated as 100 for
// percentages; otherwise, it is typically 1.
function binLength(k) {
  if (!k) return length1;
  k = k === true ? 100 : +k;
  let length; // set lazily by the transform
  const value = bin => bin.length * k / length;
  value.normalize = data => void (length = data.length);
  value.label = `Frequency${k === 100 ? " (%)" : ""}`;
  return value;
}

// If the bin length requires normalization (per binLength above), this wraps
// the specified transform to allow it.
function maybeNormalize(transform, length) {
  return length.normalize ? (data, facets) => {
    length.normalize(data);
    return transform(data, facets);
  } : transform;
}
