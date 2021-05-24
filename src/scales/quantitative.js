import {
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
  piecewise,
  scaleDiverging,
  scaleDivergingLog,
  scaleDivergingPow,
  scaleDivergingSqrt,
  scaleDivergingSymlog,
  scaleLinear,
  scaleLog,
  scalePow,
  scaleSqrt,
  scaleQuantile,
  scaleSymlog,
  scaleThreshold,
  scaleIdentity
} from "d3";
import {ordinalScheme, quantitativeScheme, quantitativeSchemes} from "./schemes.js";
import {registry, radius, opacity, color} from "./index.js";
import {defined, positive, negative} from "../defined.js";
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

function Interpolator(interpolate) {
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
  scheme,
  type,
  interpolate = registry.get(key) === color ? (range !== undefined ? interpolateRgb : scheme !== undefined ? quantitativeScheme(scheme) : quantitativeSchemes.get(type === "cyclical" ? "rainbow" : "turbo")) : round ? interpolateRound : undefined,
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
  if (scale.interpolate && interpolate !== undefined) {
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
  scheme,
  domain = inferFullDomain(channels),
  range = ordinalScheme(scheme === undefined ? "rdylbu" : scheme)({length: quantiles}).slice(0, quantiles),
  ...options
}) {
  return ScaleQ(key, scaleQuantile(), [], {domain, range, ...options});
}

export function ScaleSymlog(key, channels, {constant = 1, ...options}) {
  return ScaleQ(key, scaleSymlog().constant(constant), channels, options);
}

export function ScaleThreshold(key, channels, {
  domain = inferDomain(channels),
  scheme,
  range = ordinalScheme(scheme === undefined ? "rdylbu" : scheme)({length: domain.length + 1}),
  ...options
}) {
  return ScaleQ(key, scaleThreshold(), channels, {domain, range, ...options});
}

export function ScaleIdentity() {
  return {type: "identity", scale: scaleIdentity()};
}

function ScaleD(key, scale, channels, {
  nice,
  clamp,
  domain = inferDomain(channels),
  pivot = 0,
  range,
  scheme,
  interpolate = registry.get(key) === color ? (range !== undefined ? interpolateRgb : quantitativeScheme(scheme !== undefined ? scheme : "rdbu")) : undefined,
  reverse
}) {
  domain = [Math.min(domain[0], pivot), pivot, Math.max(domain[1], pivot)];
  if (reverse = !!reverse) domain = reverseof(domain);

  // Sometimes interpolator is named interpolator, such as "lab" for Lab color
  // space; other times it is a function that takes t in [0, 1].
  if (interpolate !== undefined && typeof interpolate !== "function") {
    interpolate = Interpolator(interpolate);
  }

  // If an explicit range is specified, promote it to a piecewise interpolator.
  if (range !== undefined) interpolate = piecewise(interpolate, range);

  scale.domain(domain).interpolator(interpolate);
  if (clamp) scale.clamp(clamp);
  if (nice) scale.nice(nice);
  return {type: "quantitative", reverse, domain, scale};
}

export function ScaleDiverging(key, channels, options) {
  return ScaleD(key, scaleDiverging(), channels, options);
}

export function ScaleDivergingSqrt(key, channels, options) {
  return ScaleD(key, scaleDivergingSqrt(), channels, options);
}

export function ScaleDivergingPow(key, channels, {exponent = 1, ...options}) {
  return ScaleD(key, scaleDivergingPow().exponent(exponent), channels, options);
}

export function ScaleDivergingLog(key, channels, {base = 10, pivot = 1, domain = inferDomain(channels, pivot < 0 ? negative : positive), ...options}) {
  return ScaleD(key, scaleDivergingLog().base(base), channels, {domain, pivot, ...options});
}

export function ScaleDivergingSymlog(key, channels, {constant = 1, ...options}) {
  return ScaleD(key, scaleDivergingSymlog().constant(constant), channels, options);
}

function inferDomain(channels, f) {
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

function inferFullDomain(channels) {
  let domain = [];
  for (const {value} of channels) {
    if (value !== undefined) domain = domain.concat(value);
  }
  return domain.filter(defined);
}
