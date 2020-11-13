import {min, max, reverse, sort} from "d3-array";
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

export function ScaleQ(scale, encodings, {
  nice,
  domain = inferDomain(encodings),
  round,
  range,
  invert
}) {
  if (invert = !!invert) domain = reverse(domain);
  scale.domain(domain);
  if (nice) scale.nice(nice === true ? undefined : nice);
  if (round) scale.interpolate(interpolateRound);
  return {type: "quantitative", invert, domain, range, scale};
}

export function ScaleLinear(key, encodings, options) {
  return ScaleQ(
    key === "color"
      ? scaleSequential(interpolateTurbo)
      : scaleLinear(),
    encodings,
    options
  );
}

export function ScalePow(key, encodings, {exponent = 1, ...options}) {
  return ScaleQ(
    (key === "color"
      ? scaleSequentialPow(interpolateTurbo)
      : scalePow()).exponent(exponent),
    encodings,
    options
  );
}

export function ScaleLog(key, encodings, {base = 10, ...options}) {
  return ScaleQ(
    (key === "color"
      ? scaleSequentialLog(interpolateTurbo)
      : scaleLog()).base(base),
    encodings,
    options
  );
}

export function ScaleSymlog(key, encodings, {constant = 1, ...options}) {
  return ScaleQ(
    (key === "color"
      ? scaleSequentialSymlog(interpolateTurbo)
      : scaleSymlog()).constant(constant),
    encodings,
    options
  );
}

export function ScaleDiverging(key, encodings, {
  nice,
  domain = inferDomain(encodings),
  pivot = 0,
  range,
  invert
}) {
  domain = [Math.min(domain[0], pivot), pivot, Math.max(domain[1], pivot)];
  if (invert = !!invert) domain = reverse(domain);
  const scale = scaleDiverging(domain, interpolateRdBu);
  if (nice) scale.nice(nice);
  return {type: "quantitative", invert, domain, range, scale};
}

function inferDomain(encodings) {
  return [
    min(encodings, ({value}) => min(value)),
    max(encodings, ({value}) => max(value))
  ];
}
