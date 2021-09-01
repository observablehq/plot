import {
  ascending,
  interpolateHcl,
  interpolateHsl,
  interpolateLab,
  interpolateNumber,
  interpolateRgb,
  interpolateRound,
  min,
  max,
  quantile,
  reverse as reverseof,
  pairs,
  scaleLinear,
  scaleLog,
  scalePow,
  scaleSqrt,
  scaleQuantile,
  scaleSymlog,
  scaleThreshold,
  scaleIdentity
} from "d3";
import {ordinalRange, quantitativeScheme} from "./schemes.js";
import {registry, radius, opacity, color} from "./index.js";
import {positive, negative} from "../defined.js";
import {constant} from "../mark.js";

const flip = i => t => i(1 - t);

const interpolators = new Map([
  // numbers
  ["number", interpolateNumber],

  // color spaces
  ["rgb", interpolateRgb],
  ["hsl", interpolateHsl],
  ["hcl", interpolateHcl],
  ["lab", interpolateLab]
]);

export function Interpolator(interpolate) {
  const i = (interpolate + "").toLowerCase();
  if (!interpolators.has(i)) throw new Error(`unknown interpolator: ${i}`);
  return interpolators.get(i);
}

export function ScaleQ(key, scale, channels, {
  nice,
  clamp,
  zero,
  domain = (registry.get(key) === radius || registry.get(key) === opacity ? inferZeroDomain : inferDomain)(channels),
  percent,
  round,
  range = registry.get(key) === radius ? inferRadialRange(channels, domain) : registry.get(key) === opacity ? [0, 1] : undefined,
  type,
  scheme = type === "cyclical" ? "rainbow" : "turbo",
  interpolate = registry.get(key) === color ? (range !== undefined ? interpolateRgb : quantitativeScheme(scheme)) : round ? interpolateRound : undefined,
  reverse,
  inset
}) {
  if (zero) domain = domain[1] < 0 ? [domain[0], 0] : domain[0] > 0 ? [0, domain[1]] : domain;
  if (reverse = !!reverse) domain = reverseof(domain);
  scale.domain(domain);
  if (nice) scale.nice(nice === true ? undefined : nice);

  // Sometimes interpolator is named interpolator, such as "lab" for Lab color
  // space. Other times interpolate is a function that takes two arguments and
  // is used in conjunction with the range. And other times the interpolate
  // function is a “fixed” interpolator independent of the range, as when a
  // color scheme such as interpolateRdBu is used.
  if (interpolate !== undefined) {
    if (typeof interpolate !== "function") {
      interpolate = Interpolator(interpolate);
    } else if (interpolate.length === 1) {
      if (reverse) interpolate = flip(interpolate);
      interpolate = constant(interpolate);
    }
    scale.interpolate(interpolate);
  }

  if (range !== undefined) scale.range(range);
  if (clamp) scale.clamp(clamp);
  return {type: "quantitative", reverse, domain, range, scale, inset, percent};
}

export function ScaleLinear(key, channels, options) {
  return ScaleQ(key, scaleLinear(), channels, options);
}

export function ScaleSqrt(key, channels, options) {
  return ScaleQ(key, scaleSqrt(), channels, options);
}

export function ScalePow(key, channels, {exponent = 1, ...options}) {
  return ScaleQ(key, scalePow().exponent(exponent), channels, options);
}

export function ScaleLog(key, channels, {base = 10, domain = inferLogDomain(channels), ...options}) {
  return ScaleQ(key, scaleLog().base(base), channels, {domain, ...options});
}

export function ScaleQuantile(key, channels, {
  quantiles = 5,
  scheme = "rdylbu",
  domain = inferQuantileDomain(channels),
  range = registry.get(key) === color ? ordinalRange(scheme, quantiles) : undefined,
  reverse,
  percent
}) {
  if (reverse = !!reverse) range = reverseof(range); // domain unordered, so reverse range
  return {type: "quantile", scale: scaleQuantile(domain, range), reverse, domain, range, percent};
}

export function ScaleSymlog(key, channels, {constant = 1, ...options}) {
  return ScaleQ(key, scaleSymlog().constant(constant), channels, options);
}

export function ScaleThreshold(key, channels, {
  domain = [0], // explicit thresholds in ascending order
  scheme = "rdylbu",
  range = registry.get(key) === color ? ordinalRange(scheme, domain.length + 1) : undefined,
  reverse,
  percent
}) {
  if (!pairs(domain).every(([a, b]) => ascending(a, b) <= 0)) throw new Error("non-ascending domain");
  if (reverse = !!reverse) range = reverseof(range); // domain ascending, so reverse range
  return {type: "threshold", scale: scaleThreshold(domain, range), reverse, domain, range, percent};
}

export function ScaleIdentity() {
  return {type: "identity", scale: scaleIdentity()};
}

export function inferDomain(channels, f) {
  return [
    min(channels, ({value}) => value === undefined ? value : min(value, f)),
    max(channels, ({value}) => value === undefined ? value : max(value, f))
  ];
}

function inferZeroDomain(channels) {
  return [0, max(channels, ({value}) => value === undefined ? value : max(value))];
}

// We don’t want the upper bound of the radial domain to be zero, as this would
// be degenerate, so we ignore nonpositive values.
function inferRadialRange(channels, domain) {
  const h25 = quantile(channels, 0.5, ({value}) => value === undefined ? NaN : quantile(value, 0.25, positive));
  return domain.map(d => 3 * Math.sqrt(d / h25));
}

function inferLogDomain(channels) {
  for (const {value} of channels) {
    if (value !== undefined) {
      for (let v of value) {
        v = +v;
        if (v > 0) return inferDomain(channels, positive);
        if (v < 0) return inferDomain(channels, negative);
      }
    }
  }
  return [1, 10];
}

function inferQuantileDomain(channels) {
  const domain = [];
  for (const {value} of channels) {
    if (value === undefined) continue;
    for (const v of value) domain.push(v);
  }
  return domain;
}
