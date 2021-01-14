import {arrayify, identity, maybeLabel} from "../mark.js";
import {bin1, bin2} from "../transforms/bin.js";
import {rect, rectX, rectY} from "./rect.js";

export function bin(data, {x, y, domain, thresholds, normalize, transform, ...options} = {}) {
  data = arrayify(data);
  if (transform) data = transform(data);
  return rect(
    data,
    {
      insetTop: 1,
      insetLeft: 1,
      ...options,
      transform: bin2({x, y, domain, thresholds}),
      fill: normalize ? normalizer(normalize, data.length) : length,
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
  transform,
  ...options
} = {}) {
  data = arrayify(data);
  if (transform) data = transform(data);
  return rectY(
    data,
    {
      insetLeft: 1,
      ...options,
      transform: bin1({value: x, domain, thresholds, cumulative}),
      y: normalize ? normalizer(normalize, data.length) : length,
      x1: maybeLabel(x0, x),
      x2: x1
    }
  );
}

export function binY(data, {
  y = identity,
  domain,
  thresholds,
  normalize,
  cumulative,
  transform,
  ...options
} = {}) {
  data = arrayify(data);
  if (transform) data = transform(data);
  return rectX(
    data,
    {
      insetTop: 1,
      ...options,
      transform: bin1({value: y, domain, thresholds, cumulative}),
      x: normalize ? normalizer(normalize, data.length) : length,
      y1: maybeLabel(x0, y),
      y2: x1
    }
  );
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
function normalizer(k, n) {
  k = k === true ? 100 : +k;
  const value = bin => bin.length * k / n;
  value.label = `Frequency${k === 100 ? " (%)" : ""}`;
  return value;
}
