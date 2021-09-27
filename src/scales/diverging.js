import {
  interpolateNumber,
  interpolateRgb,
  piecewise,
  scaleDiverging,
  scaleDivergingLog,
  scaleDivergingPow,
  scaleDivergingSymlog
} from "d3";
import {positive, negative} from "../defined.js";
import {quantitativeScheme} from "./schemes.js";
import {registry, color} from "./index.js";
import {inferDomain, Interpolator, flip, interpolatePiecewise} from "./quantitative.js";

function ScaleD(key, scale, transform, channels, {
  type,
  nice,
  clamp,
  domain = inferDomain(channels),
  unknown,
  pivot = 0,
  scheme,
  range,
  symmetric = true,
  interpolate = registry.get(key) === color ? (scheme == null && range !== undefined ? interpolateRgb : quantitativeScheme(scheme !== undefined ? scheme : "rdbu")) : interpolateNumber,
  reverse
}) {
  pivot = +pivot;
  let [min, max] = domain;
  min = Math.min(min, pivot);
  max = Math.max(max, pivot);

  // Sometimes interpolate is a named interpolator, such as "lab" for Lab color
  // space. Other times interpolate is a function that takes two arguments and
  // is used in conjunction with the range. And other times the interpolate
  // function is a “fixed” interpolator on the [0, 1] interval, as when a
  // color scheme such as interpolateRdBu is used.
  if (typeof interpolate !== "function") {
    interpolate = Interpolator(interpolate);
  }

  // If an explicit range is specified, promote it to a piecewise interpolator.
  if (range !== undefined) {
    interpolate = interpolate.length === 1
      ? interpolatePiecewise(interpolate)(...range)
      : piecewise(interpolate, range);
  }

  // Reverse before normalization.
  if (reverse) interpolate = flip(interpolate);

  // Normalize the interpolator for symmetric difference around the pivot.
  if (symmetric) {
    const mindelta = Math.abs(transform(min) - transform(pivot));
    const maxdelta = Math.abs(transform(max) - transform(pivot));
    if (mindelta < maxdelta) interpolate = truncateLower(interpolate, mindelta / maxdelta);
    else if (mindelta > maxdelta) interpolate = truncateUpper(interpolate, maxdelta / mindelta);
  }

  scale.domain([min, pivot, max]).unknown(unknown).interpolator(interpolate);
  if (clamp) scale.clamp(clamp);
  if (nice) scale.nice(nice);
  return {type, interpolate, scale};
}

export function ScaleDiverging(key, channels, options) {
  return ScaleD(key, scaleDiverging(), x => x, channels, options);
}

export function ScaleDivergingSqrt(key, channels, options) {
  return ScaleDivergingPow(key, channels, {...options, exponent: 0.5});
}

export function ScaleDivergingPow(key, channels, {exponent = 1, ...options}) {
  return ScaleD(key, scaleDivergingPow().exponent(exponent), transformPow(exponent), channels, {...options, type: "diverging-pow"});
}

export function ScaleDivergingLog(key, channels, {base = 10, pivot = 1, domain = inferDomain(channels, pivot < 0 ? negative : positive), ...options}) {
  return ScaleD(key, scaleDivergingLog().base(base), Math.log, channels, {domain, pivot, ...options});
}

export function ScaleDivergingSymlog(key, channels, {constant = 1, ...options}) {
  return ScaleD(key, scaleDivergingSymlog().constant(constant), transformSymlog(constant), channels, options);
}

function truncateLower(interpolate, k) {
  return t => interpolate(t < 0.5 ? t * k + (1 - k) / 2 : t);
}

function truncateUpper(interpolate, k) {
  return t => interpolate(t > 0.5 ? t * k + (1 - k) / 2 : t);
}

function transformPow(exponent) {
  return exponent === 0.5 ? Math.sqrt : x => Math.sign(x) * Math.pow(Math.abs(x), exponent);
}

function transformSymlog(constant) {
  return x => Math.sign(x) * Math.log1p(Math.abs(x / constant));
}
