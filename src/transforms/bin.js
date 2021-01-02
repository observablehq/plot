import {bin as binner, cross, sum} from "d3-array";
import {valueof, first, second, maybeValue, range} from "../mark.js";

export function bin1(options = {}) {
  let {value, domain, thresholds, cumulative} = maybeValue(options);
  return (data, facets) => {
    const values = valueof(data, value);
    const bin = binner().value(i => values[i]);
    if (domain !== undefined) bin.domain(domain);
    if (thresholds !== undefined) bin.thresholds(thresholds);
    let bins = bin(range(values));
    if (facets !== undefined) {
      const index = [];
      const data = [];
      for (const facet of facets.map(set)) {
        let b = bins.map(bin => binsubset(bin, facet));
        b = cumulative ? accumulate(cumulative < 0 ? b.reverse() : b) : b;
        b = b.filter(nonempty);
        index.push(range(b).map(i => i + data.length)); // TODO optimize
        data.push(...b); // TODO optimize
      }
      return {index, data};
    }
    if (cumulative) bins = accumulate(cumulative < 0 ? bins.reverse() : bins);
    bins = bins.filter(nonempty);
    return {index: range(bins), data: bins};
  };
}

export function bin2({x = {}, y = {}, domain, thresholds} = {}) {
  const binX = bin1({domain, thresholds, value: first, ...maybeValue(x)});
  const binY = bin1({domain, thresholds, value: second, ...maybeValue(y)});
  return (...args) => {
    return cross(binX(...args), binY(...args).map(binset), (x, y) => {
      return {
        x0: x.x0,
        x1: x.x1,
        y0: y.x0,
        y1: y.x1,
        length: sum(x, d => y.has(d))
      };
    }).filter(nonempty);
  };
}

function set(index) {
  return new Set(index);
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
