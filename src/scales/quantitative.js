import {min, max, reverse} from "d3-array";
import {scaleLinear, scaleLog, scalePow, scaleSymlog} from "d3-scale";

export function ScaleQ(scale, encodings, {
  nice,
  domain = inferDomain(encodings),
  invert
}) {
  if (invert = !!invert) domain = reverse(domain);
  scale.domain(domain);
  if (nice) scale.nice(nice);
  return {type: "quantitative", invert, scale};
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
