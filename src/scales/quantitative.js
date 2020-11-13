import {min, max, quantile, reverse} from "d3-array";
import {interpolateRound} from "d3-interpolate";
import {interpolateRdBu, interpolateTurbo} from "d3-scale-chromatic";
import {
  scaleDiverging,
  scaleLinear,
  scaleLog,
  scalePow,
  scaleSymlog,
  scaleSequential,
  scaleSequentialLog,
  scaleSequentialPow,
  scaleSequentialSymlog
} from "d3-scale";

export function ScaleQ(key, scale, encodings, {
  nice,
  domain = (key === "r" ? inferRadialDomain : inferDomain)(encodings),
  round,
  interpolate = round ? interpolateRound
    : key === "color" ? interpolateTurbo
    : undefined,
  range, // see autoScaleRange
  invert
}) {
  if (invert = !!invert) domain = reverse(domain);
  scale.domain(domain);
  if (nice) scale.nice(nice === true ? undefined : nice);
  if (interpolate) scale.interpolate(interpolate);
  return {type: "quantitative", invert, domain, range, scale};
}

export function ScaleLinear(key, encodings, options) {
  return ScaleQ(
    key,
    (key === "color" ? scaleSequential : scaleLinear)(),
    encodings,
    options
  );
}

export function ScalePow(key, encodings, {exponent = 1, ...options}) {
  return ScaleQ(
    key,
    (key === "color" ? scaleSequentialPow : scalePow)().exponent(exponent),
    encodings,
    options
  );
}

export function ScaleLog(key, encodings, {base = 10, ...options}) {
  return ScaleQ(
    key,
    (key === "color" ? scaleSequentialLog : scaleLog)().base(base),
    encodings,
    options
  );
}

export function ScaleSymlog(key, encodings, {constant = 1, ...options}) {
  return ScaleQ(
    key,
    (key === "color" ? scaleSequentialSymlog : scaleSymlog)().constant(constant),
    encodings,
    options
  );
}

export function ScaleDiverging(key, encodings, {
  nice,
  domain = inferDomain(encodings),
  pivot = 0,
  interpolate = interpolateRdBu,
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
