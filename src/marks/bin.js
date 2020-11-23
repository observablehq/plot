import {bin} from "d3-array";
import {field, identity, zero} from "../mark.js";
import {Rect} from "./rect.js";

// TODO configurable thresholds
// TODO facet dimension
export class Bin extends Rect {
  constructor(data, value, channels, style) {
    super(data, channels, style);
    this.value = typeof value === "string" ? field(value) : value;
  }
  initialize(data) {
    return super.initialize(bin().value(this.value)(data));
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
