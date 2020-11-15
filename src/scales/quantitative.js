import {min, max, quantile, reverse} from "d3-array";
import {interpolateRound} from "d3-interpolate";
import {interpolateRdBu, interpolateTurbo} from "d3-scale-chromatic";
import {scaleDiverging, scaleLinear, scaleLog, scalePow, scaleSymlog} from "d3-scale";

function constant(x) {
  return () => x;
}

export function ScaleQ(key, scale, encodings, {
  nice,
  domain = (key === "r" ? inferRadialDomain : inferDomain)(encodings),
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
    if (interpolate.length === 1) interpolate = constant(interpolate);
    scale.interpolate(interpolate);
  }
  if (range !== undefined) scale.range(range);
  return {type: "quantitative", invert, domain, range, scale};
}

export function ScaleLinear(key, encodings, options) {
  return ScaleQ(key, scaleLinear(), encodings, options);
}

export function ScalePow(key, encodings, {exponent = 1, ...options}) {
  return ScaleQ(key, scalePow().exponent(exponent), encodings, options);
}

export function ScaleLog(key, encodings, {base = 10, ...options}) {
  return ScaleQ(key, scaleLog().base(base), encodings, options);
}

export function ScaleSymlog(key, encodings, {constant = 1, ...options}) {
  return ScaleQ(key, scaleSymlog().constant(constant), encodings, options);
}

export function ScaleDiverging(key, encodings, {
  nice,
  domain = inferDomain(encodings),
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

function inferDomain(encodings) {
  return [
    min(encodings, ({value}) => min(value)),
    max(encodings, ({value}) => max(value))
  ];
}

function inferRadialDomain(encodings) {
  return [0, quantile(encodings, 0.5, ({value}) => quantile(value, 0.25))];
}
