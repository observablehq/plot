import {bin as binner} from "d3-array";
import {field, identity} from "../mark.js";
import {rectX, rectY} from "./rect.js";

export function bin(options = {}) {
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
      if (thresholds === undefined) bin.thresholds(thresholds = b.slice(1).map(start));
    }
    if (cumulative) {
      let sum = 0;
      return b.map(({x0, x1, length}) => ({x0, x1, length: sum += length}));
    }
    return b;
  };
}

export function binX(data, {
  x = identity,
  domain,
  thresholds,
  normalize,
  cumulative,
  ...options
} = {}) {
  return rectX(
    data,
    {
      insetTop: 1,
      ...options,
      transform: bin({value: x, domain, thresholds, cumulative}),
      x: normalize ? normalizer(normalize, data) : length,
      y1: typeof x === "string" ? startof(x) : start,
      y2: end
    }
  );
}

export function binY(data, {
  y = identity,
  domain,
  thresholds,
  normalize,
  cumulative,
  ...options
} = {}) {
  return rectY(
    data,
    {
      insetLeft: 1,
      ...options,
      transform: bin({value: y, domain, thresholds, cumulative}),
      y: normalize ? normalizer(normalize, data) : length,
      x1: typeof y === "string" ? startof(y) : start,
      x2: end
    }
  );
}

function startof(value) {
  const start = d => d.x0;
  if (typeof value === "string") start.label = value;
  return start;
}

function start(d) {
  return d.x0;
}

function end(d) {
  return d.x1;
}

function length(d) {
  return d.length;
}

length.label = "Frequency";

// An alternative channel definition to length (above) that computes the
// proportion of each bin in [0, k]. If k is true, it is treated as 100 for
// percentages; otherwise, it is typically 1.
function normalizer(k, data) {
  k = k === true ? 100 : +k;
  const n = "length" in data ? data.length
      : "size" in data ? data.size
      : Array.from(data).length;
  const value = bin => bin.length * k / n;
  value.label = `Frequency${k === 100 ? " (%)" : ""}`;
  return value;
}
