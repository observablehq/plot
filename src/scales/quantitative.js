import {min, max, quantile, reverse} from "d3-array";
import {interpolateRound} from "d3-interpolate";
import {interpolateRdBu, interpolateTurbo} from "d3-scale-chromatic";
import {scaleDiverging, scaleLinear, scaleLog, scalePow, scaleSymlog} from "d3-scale";

function constant(x) {
  return () => x;
}

function flip(i) {
  return t => i(1 - t);
}

export function ScaleQ(key, scale, channels, {
  nice,
  domain = (key === "r" ? inferRadialDomain : inferDomain)(channels),
  round,
  interpolate = round ? interpolateRound : key === "color" ? interpolateTurbo : undefined,
  range = key === "r" ? [0, 3] : undefined, // see autoScaleRange
  invert
}) {
  if (invert = !!invert) domain = reverse(domain);
  scale.domain(domain);
  if (nice) scale.nice(nice === true ? undefined : nice);
  if (interpolate !== undefined) {
    // Sometimes interpolate is a function that takes two arguments and is used
    // in conjunction with the range; for example, interpolateLab might be used
    // to interpolate two colors in Lab color space. Other times the interpolate
    // function is a “fixed” interpolator independent of the range, as when a
    // color scheme such as interpolateRdBu is used.
    if (interpolate.length === 1) {
      if (invert) interpolate = flip(interpolate);
      interpolate = constant(interpolate);
    }
    scale.interpolate(interpolate);
  }
  if (range !== undefined) scale.range(range);
  return {type: "quantitative", invert, domain, range, scale};
}

export function ScaleLinear(key, channels, options) {
  return ScaleQ(key, scaleLinear(), channels, options);
}

export function ScalePow(key, channels, {exponent = 1, ...options}) {
  return ScaleQ(key, scalePow().exponent(exponent), channels, options);
}

export function ScaleLog(key, channels, {base = 10, ...options}) {
  return ScaleQ(key, scaleLog().base(base), channels, options);
}

export function ScaleSymlog(key, channels, {constant = 1, ...options}) {
  return ScaleQ(key, scaleSymlog().constant(constant), channels, options);
}

export function ScaleDiverging(key, channels, {
  nice,
  domain = inferDomain(channels),
  pivot = 0,
  interpolate = key === "color" ? interpolateRdBu : undefined,
  invert
}) {
  domain = [Math.min(domain[0], pivot), pivot, Math.max(domain[1], pivot)];
  if (invert = !!invert) domain = reverse(domain);
  const scale = scaleDiverging(domain, interpolate);
  if (nice) scale.nice(nice);
  return {type: "quantitative", invert, domain, scale};
}

function inferDomain(channels) {
  return [
    min(channels, ({value}) => value === undefined ? value : min(value)),
    max(channels, ({value}) => value === undefined ? value : max(value))
  ];
}

function inferRadialDomain(channels) {
  return [
    0,
    quantile(channels, 0.5, ({value}) => value === undefined ? value : quantile(value, 0.25))
  ];
}
