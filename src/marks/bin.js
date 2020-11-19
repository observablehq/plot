import {bin as Bin} from "d3-array";
import {field, identity} from "../mark.js";
import {rectX, rectY} from "./rect.js";

export function binX(data, {x = identity} = {}, style) {
  return rectX(
    bin(data, x), // TODO configurable thresholds
    {y1: typeof x === "string" ? startof(x) : start, y2: end, x: length},
    {insetTop: 1, ...style}
  );
}

export function binY(data, {y = identity} = {}, style) {
  return rectY(
    bin(data, y), // TODO configurable thresholds
    {x1: typeof y === "string" ? startof(y) : start, x2: end, y: length},
    {insetLeft: 1, ...style}
  );
}

function bin(data, value) {
  if (typeof value === "string") value = field(value);
  return Bin().value(value)(data);
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
