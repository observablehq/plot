import {bin as binner, cross} from "d3-array";
import {valueof, first, second, maybeValue, range, offsetRange} from "../mark.js";

export function bin1(options = {}) {
  let {value, domain, thresholds, cumulative} = maybeValue(options);
  const bin = binof({value, domain, thresholds});
  return (data, facets) => {
    let bins = bin(data);
    if (facets !== undefined) return binfacets(bins, facets, cumulative);
    if (cumulative) bins = accumulate(cumulative < 0 ? bins.reverse() : bins);
    bins = bins.filter(nonempty);
    return {index: range(bins), data: bins};
  };
}

export function bin2({x = {}, y = {}, domain, thresholds} = {}) {
  const binX = binof({domain, thresholds, value: first, ...maybeValue(x)});
  const binY = binof({domain, thresholds, value: second, ...maybeValue(y)});
  return (data, facets) => {
    let bins = cross(binX(data).filter(nonempty), binY(data).filter(nonempty).map(binset), binsubset);
    if (facets !== undefined) return binfacets(bins, facets);
    bins = bins.filter(nonempty);
    return {index: range(bins), data: bins};
  };
}

function set(index) {
  return new Set(index);
}

function binof({value, domain, thresholds}) {
  return data => {
    const values = valueof(data, value);
    const bin = binner().value(i => values[i]);
    if (domain !== undefined) bin.domain(domain);
    if (thresholds !== undefined) bin.thresholds(thresholds);
    return bin(range(values));
  };
}

function binfacets(bins, facets, cumulative) {
  const index = [];
  const data = [];
  for (const facet of facets.map(set)) {
    let b = bins.map(bin => binsubset(bin, facet));
    b = cumulative ? accumulate(cumulative < 0 ? b.reverse() : b) : b;
    b = b.filter(nonempty);
    index.push(offsetRange(b, data.length));
    data.push(b);
  }
  return {index, data: data.flat()};
}

function binset(bin) {
  const set = new Set(bin);
  set.x0 = bin.x0;
  set.x1 = bin.x1;
  return set;
}

function binsubset(bin, index) {
  const subbin = bin.filter(i => index.has(i));
  subbin.x0 = bin.x0;
  subbin.x1 = bin.x1;
  return subbin;
}

function accumulate(bins) {
  let sum = 0;
  return bins.map(({x0, x1, length}) => ({x0, x1, length: sum += length}));
}

function nonempty({length}) {
  return length > 0;
}
