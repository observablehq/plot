import {
  ascending,
  extent,
  interpolateHcl,
  interpolateHsl,
  interpolateLab,
  interpolateNumber,
  interpolateRgb,
  interpolateRound,
  min,
  max,
  quantile,
  quantize,
  reverse as reverseof,
  pairs,
  scaleLinear,
  scaleLog,
  scalePow,
  scaleQuantile,
  scaleSymlog,
  scaleThreshold,
  scaleIdentity
} from "d3";
import {ordinalRange, quantitativeScheme} from "./schemes.js";
import {registry, radius, opacity, color} from "./index.js";
import {positive, negative} from "../defined.js";
import {constant} from "../mark.js";
import {order} from "../scales.js";

export const flip = i => t => i(1 - t);

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
  const i = `${interpolate}`.toLowerCase();
  if (!interpolators.has(i)) throw new Error(`unknown interpolator: ${i}`);
  return interpolators.get(i);
}

export function ScaleQ(key, scale, channels, {
  nice,
  clamp,
  zero,
  domain = (registry.get(key) === radius || registry.get(key) === opacity ? inferZeroDomain : inferDomain)(channels),
  round,
  range = registry.get(key) === radius ? inferRadialRange(channels, domain) : registry.get(key) === opacity ? [0, 1] : undefined,
  type,
  scheme = type === "cyclical" ? "rainbow" : "turbo",
  interpolate = registry.get(key) === color ? (range !== undefined ? interpolateRgb : quantitativeScheme(scheme)) : round ? interpolateRound : interpolateNumber,
  reverse,
  inset = 0
}) {
  if (type === "cyclical" || type === "sequential") type = "linear"; // shorthand for color schemes
  reverse = !!reverse;
  inset = +inset;

  // Sometimes interpolate is a named interpolator, such as "lab" for Lab color
  // space. Other times interpolate is a function that takes two arguments and
  // is used in conjunction with the range. And other times the interpolate
  // function is a “fixed” interpolator on the [0, 1] interval, as when a
  // color scheme such as interpolateRdBu is used.
  if (interpolate !== undefined) {
    if (typeof interpolate !== "function") {
      interpolate = Interpolator(interpolate);
    }
    if (interpolate.length === 1) {
      if (reverse) {
        interpolate = flip(interpolate);
        reverse = false;
      }
      if (domain.length > 2) {
        if (range === undefined) range = Float64Array.from(domain, (_, i) => i / (domain.length - 1));
        scale.interpolate(interpolatePiecewise(interpolate));
      } else {
        scale.interpolate(constant(interpolate));
      }
    } else {
      scale.interpolate(interpolate);
    }
  } else {
    interpolate = scale.interpolate();
  }

  // If a zero option is specified, we assume that the domain is numeric, and we
  // want to ensure that the domain crosses zero. However, note that the domain
  // may be reversed (descending) so we shouldn’t assume that the first value is
  // smaller than the last; and also it’s possible that the domain has more than
  // two values for a “poly” scale. And lastly be careful not to mutate input!
  if (zero) {
    const [min, max] = extent(domain);
    if ((min > 0) || (max < 0)) {
      domain = Array.from(domain);
      if (order(domain) < 0) domain[domain.length - 1] = 0;
      else domain[0] = 0;
    }
  }

  if (reverse) domain = reverseof(domain);
  scale.domain(domain);
  if (nice) scale.nice(nice === true ? undefined : nice);
  if (range !== undefined) scale.range(range);
  if (clamp) scale.clamp(clamp);
  return {type, domain, range, scale, interpolate, inset};
}

export function ScaleLinear(key, channels, options) {
  return ScaleQ(key, scaleLinear(), channels, options);
}

export function ScaleSqrt(key, channels, options) {
  return ScalePow(key, channels, {...options, exponent: 0.5});
}

export function ScalePow(key, channels, {exponent = 1, ...options}) {
  return ScaleQ(key, scalePow().exponent(exponent), channels, {...options, type: "pow"});
}

export function ScaleLog(key, channels, {base = 10, domain = inferLogDomain(channels), ...options}) {
  return ScaleQ(key, scaleLog().base(base), channels, {...options, domain});
}

export function ScaleQuantile(key, channels, {
  quantiles = 5,
  scheme = "rdylbu",
  domain = inferQuantileDomain(channels),
  interpolate,
  range = interpolate !== undefined ? quantize(interpolate, quantiles) : registry.get(key) === color ? ordinalRange(scheme, quantiles) : undefined,
  reverse
}) {
  return ScaleThreshold(key, channels, {
    domain: scaleQuantile(domain, range).quantiles(),
    range,
    reverse
  });
}

export function ScaleSymlog(key, channels, {constant = 1, ...options}) {
  return ScaleQ(key, scaleSymlog().constant(constant), channels, options);
}

export function ScaleThreshold(key, channels, {
  domain = [0], // explicit thresholds in ascending order
  scheme = "rdylbu",
  interpolate,
  range = interpolate !== undefined ? quantize(interpolate, domain.length + 1) : registry.get(key) === color ? ordinalRange(scheme, domain.length + 1) : undefined,
  reverse
}) {
  if (!pairs(domain).every(([a, b]) => ascending(a, b) <= 0)) throw new Error("non-ascending domain");
  if (reverse) range = reverseof(range); // domain ascending, so reverse range
  return {type: "threshold", scale: scaleThreshold(domain, range), domain, range};
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

function interpolatePiecewise(interpolate) {
  return (i, j) => t => interpolate(i + t * (j - i));
}
