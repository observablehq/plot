import {bin as binner, cross, sum} from "d3-array";
import {valueof, first, second, maybeValue, range} from "../mark.js";

export function bin1(options = {}) {
  let {value, domain, thresholds, cumulative} = maybeValue(options);
  let values;
  const bin = binner().value(i => values[i]);
  if (domain !== undefined) bin.domain(domain);
  if (thresholds !== undefined) bin.thresholds(thresholds);
  return (data, index, allData = data) => {
    let b;
    if (values === undefined) values = valueof(allData, value);
    // We don’t want to choose thresholds dynamically for each facet; instead,
    // we extract the set of thresholds from an initial pass over all data.
    if (domain === undefined || thresholds === undefined) {
      b = bin(range(allData));
      if (domain === undefined) bin.domain(domain = [b[0].x0, b[b.length - 1].x1]);
      if (thresholds === undefined) bin.thresholds(thresholds = b.slice(1).map(b => b.x0));
      if (index !== undefined) b = bin(index);
    } else {
      if (index === undefined) index = range(data);
      b = bin(index);
    }
    if (cumulative) {
      let sum = 0;
      if (cumulative < 0) b.reverse();
      b = b.map(({x0, x1, length}) => ({x0, x1, length: sum += length}));
    }
    return b.filter(nonempty);
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

function binset(bin) {
  const set = new Set(bin);
  set.x0 = bin.x0;
  set.x1 = bin.x1;
  return set;
}

function nonempty({length}) {
  return length > 0;
}
