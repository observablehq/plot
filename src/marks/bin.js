import {bin as binner} from "d3-array";
import {field, identity, zero} from "../mark.js";
import {Rect} from "./rect.js";

export class Bin extends Rect {
  constructor(data, {value, domain, thresholds, ...options} = {}) {
    super(data, options);
    if (typeof value !== "function") value = field(value + "");
    const bin = this.bin = binner().value(value);
    if (domain !== undefined) bin.domain(domain);
    if (thresholds !== undefined) bin.thresholds(thresholds);
    // We don’t want to choose thresholds dynamically for each facet; instead,
    // we extract the set of thresholds from an initial computation.
    if (domain === undefined || thresholds === undefined) {
      const b = bin(data);
      if (domain === undefined) bin.domain([b[0].x0, b[b.length - 1].x1]);
      if (thresholds === undefined) bin.thresholds(b.slice(1).map(start));
    }
  }
  initialize(data) {
    return super.initialize(this.bin(data));
  }
}

export function binX(data, {x = identity, ...options} = {}) {
  return new Bin(
    data,
    {
      insetTop: 1,
      ...options,
      value: x,
      x1: zero,
      y1: typeof x === "string" ? startof(x) : start,
      x2: length,
      y2: end
    }
  );
}

export function binY(data, {y = identity, ...options} = {}) {
  return new Bin(
    data,
    {
      insetLeft: 1,
      ...options,
      value: y,
      x1: typeof y === "string" ? startof(y) : start,
      y1: zero,
      x2: end,
      y2: length
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
