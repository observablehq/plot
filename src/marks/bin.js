import {bin} from "d3-array";
import {field, identity, zero} from "../mark.js";
import {Rect} from "./rect.js";

export class Bin extends Rect {
  constructor(data, {value, ...channels}, style) {
    super(data, channels, style);
    this.value = value;
  }
  facet({y}) {
    return bins(this.data, this.value, y);
  }
}

export function binX(data, {x = identity} = {}, style) {
  return new Bin(
    data,
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
    {
      x1: typeof y === "string" ? startof(y) : start,
      y1: zero,
      x2: end,
      y2: length
    },
    {insetLeft: 1, ...style}
  );
}

// TODO configurable thresholds
// TODO facet dimension
function bins(data, value) {
  if (typeof value === "string") value = field(value);
  return bin().value(value)(data);
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
