import {identity} from "../mark.js";
import {bin1, bin2} from "../transforms/bin.js";
import {rect, rectX, rectY} from "./rect.js";

export function bin(data, {x, y, domain, thresholds, normalize, ...options} = {}) {
  return rect(
    data,
    {
      insetTop: 1,
      insetLeft: 1,
      ...options,
      transform: bin2({x, y, domain, thresholds}),
      fill: normalize ? normalizer(normalize, data) : length,
      x1: maybeLabel(x0, x),
      x2: x1,
      y1: maybeLabel(y0, y),
      y2: y1
    }
  );
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
      transform: bin1({value: x, domain, thresholds, cumulative}),
      x: normalize ? normalizer(normalize, data) : length,
      y1: maybeLabel(x0, x),
      y2: x1
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
      transform: bin1({value: y, domain, thresholds, cumulative}),
      y: normalize ? normalizer(normalize, data) : length,
      x1: maybeLabel(x0, y),
      x2: x1
    }
  );
}

// If the channel value is specified as a string, indicating a named field, this
// wraps the specified function f with another function with the corresponding
// label property, such that the associated axis inherits the label by default.
function maybeLabel(f, label) {
  return typeof label === "string" ? Object.assign(d => f(d), {label}) : f;
}

function x0(d) {
  return d.x0;
}

function x1(d) {
  return d.x1;
}

function y0(d) {
  return d.y0;
}

function y1(d) {
  return d.y1;
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
