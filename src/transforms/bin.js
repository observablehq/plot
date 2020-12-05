import {bin as binner, cross, sum} from "d3-array";
import {field, first, second} from "../mark.js";

export function bin1(options = {}) {
  if (typeof options === "string") options = {value: options};
  let {value, domain, thresholds, cumulative} = options;
  if (typeof value !== "function") value = field(value + "");
  const bin = binner().value(value);
  if (domain !== undefined) bin.domain(domain);
  if (thresholds !== undefined) bin.thresholds(thresholds);
  return data => {
    const b = bin(data);
    // We don’t want to choose thresholds dynamically for each facet; instead,
    // we extract the set of thresholds from an initial computation.
    if (domain === undefined || thresholds === undefined) {
      if (domain === undefined) bin.domain(domain = [b[0].x0, b[b.length - 1].x1]);
      if (thresholds === undefined) bin.thresholds(thresholds = b.slice(1).map(b => b.x0));
    }
    if (cumulative) {
      let sum = 0;
      if (cumulative < 0) b.reverse();
      return b.map(({x0, x1, length}) => ({x0, x1, length: sum += length}));
    }
    return b;
  };
}

export function bin2({x = {}, y = {}, domain, thresholds} = {}) {
  if (isvalue(x)) x = {value: x};
  if (isvalue(y)) y = {value: y};
  const binX = bin1({domain, thresholds, value: first, ...x});
  const binY = bin1({domain, thresholds, value: second, ...y});
  return data => {
    return cross(binX(data), binY(data).map(binset), (x, y) => {
      return {
        x0: x.x0,
        x1: x.x1,
        y0: y.x0,
        y1: y.x1,
        length: sum(x, d => y.has(d))
      };
    });
  };
}

function isvalue(x) {
  return typeof x === "string" || typeof x === "function";
}

function binset(bin) {
  const set = new Set(bin);
  set.x0 = bin.x0;
  set.x1 = bin.x1;
  return set;
}
