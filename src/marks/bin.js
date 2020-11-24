import {bin as binner} from "d3-array";
import {field, identity, zero} from "../mark.js";
import {Rect} from "./rect.js";

export class Bin extends Rect {
  constructor(data, {value, normalize, domain, thresholds, ...options} = {}) {
    super(data, options);
    if (typeof value !== "function") value = field(value + "");
    const bin = this.bin = binner().value(value);

    // We don’t want to choose thresholds dynamically for each facet; instead,
    // we extract the set of thresholds from an initial computation.
    if (domain !== undefined) bin.domain(domain);
    if (thresholds !== undefined) bin.thresholds(thresholds);
    if (domain === undefined || thresholds === undefined) {
      const b = bin(data);
      if (domain === undefined) bin.domain([b[0].x0, b[b.length - 1].x1]);
      if (thresholds === undefined) bin.thresholds(b.slice(1).map(start));
    }

    // Allow the bin values to be normalized (e.g., percentage or proportion).
    if (normalize) this.bin = proportion(bin);
  }
  initialize(data) {
    return super.initialize(this.bin(data));
  }
}

export function binX(data, {x = identity, normalize, ...options} = {}) {
  return new Bin(
    data,
    {
      insetTop: 1,
      normalize,
      ...options,
      value: x,
      x1: zero,
      y1: typeof x === "string" ? startof(x) : start,
      x2: normalize ? normalizedProportion(normalize) : length,
      y2: end
    }
  );
}

export function binY(data, {y = identity, normalize, ...options} = {}) {
  return new Bin(
    data,
    {
      insetLeft: 1,
      normalize,
      ...options,
      value: y,
      x1: typeof y === "string" ? startof(y) : start,
      y1: zero,
      x2: end,
      y2: normalize ? normalizedProportion(normalize) : length
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

// Wraps a d3.bin instance to populate the proportion in [0, 1] for each bin.
function proportion(bin) {
  return data => bin(data).map(bin => {
    bin.proportion = bin.length / data.length;
    return bin;
  });
}

// An alternative to length (above) that scales the proportion to [0, k]. If k
// is true, it is treated as 100 for percentages; otherwise, it is typically 1.
function normalizedProportion(k) {
  k = k === true ? 100 : +k;
  const proportion = d => d.proportion * k;
  proportion.label = `Frequency${k === 100 ? " (%)" : ""}`;
  return proportion;
}
