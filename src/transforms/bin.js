import {bin as binner, cross} from "d3-array";
import {valueof, first, second, maybeValue, range, offsetRange} from "../mark.js";

export function bin1(options = {}) {
  let {value, domain, thresholds, cumulative} = maybeValue(options);
  const bin = binof({value, domain, thresholds});
  return (data, facets) => rebin(bin(data), facets, subset1, cumulative);
}

export function bin2({x = {}, y = {}, domain, thresholds} = {}) {
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
