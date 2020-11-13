import {min, max, reverse} from "d3-array";
import {interpolateRound} from "d3-interpolate";
import {scaleLinear, scaleLog, scalePow, scaleSymlog} from "d3-scale";

export function ScaleQ(scale, encodings, {
  nice,
  domain = inferDomain(encodings),
  round,
  range,
  invert
}) {
  if (invert = !!invert) domain = reverse(domain);
  scale.domain(domain);
  if (nice) scale.nice(nice);
  if (round) scale.interpolate(interpolateRound);
  return {type: "quantitative", invert, domain, range, scale};
}

export function ScaleLinear(encodings, options) {
  return ScaleQ(scaleLinear(), encodings, options);
}

export function ScalePow(encodings, {exponent = 1, ...options}) {
  return ScaleQ(scalePow().exponent(exponent), encodings, options);
}

export function ScaleLog(encodings, {base = 10, ...options}) {
  return ScaleQ(scaleLog().base(base), encodings, options);
}

export function ScaleSymlog(encodings, {constant = 1, ...options}) {
  return ScaleQ(scaleSymlog().constant(constant), encodings, options);
}

function inferDomain(encodings) {
  return [
    min(encodings, ({value}) => min(value)),
    max(encodings, ({value}) => max(value))
  ];
}
