import {bin} from "d3-array";
import {field, identity, zero} from "../mark.js";
import {Rect} from "./rect.js";

// TODO Configurable thresholds
// TODO What if value accessor is non-deterministic?
// TODO What if data is not an array?
export class Bin extends Rect {
  constructor(data, value, channels, style) {
    super(data, channels, style);
    // Because faceting may be in use, we don’t want d3.bin to choose thresholds
    // dynamically based on the input data; instead, we extract the set of
    // thresholds from an initial computation.
    this.bin = bin().value(typeof value === "string" ? field(value) : value);
    const bins = this.bin(data);
    this.bin.domain([bins[0].x0, bins[bins.length - 1].x1]);
    this.bin.thresholds(bins.slice(1).map(start));
  }
  initialize(data) {
    return super.initialize(this.bin(data));
  }
}

export function binX(data, {x = identity} = {}, style) {
  return new Bin(
    data,
    x,
    {
      x1: zero,
      y1: typeof x === "string" ? startof(x) : start,
      x2: length,
      y2: end
    },
    {insetTop: 1, ...style}
  );
}

export function binY(data, {y = identity} = {}, style) {
  return new Bin(
    data,
    y,
    {
      x1: typeof y === "string" ? startof(y) : start,
      y1: zero,
      x2: end,
      y2: length
    },
    {insetLeft: 1, ...style}
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
