import {reverse, sort} from "d3-array";
import {scaleBand, scalePoint} from "d3-scale";

export function ScaleO(scale, encodings, {
  align = 0.5,
  domain = inferDomain(encodings),
  round = true,
  range,
  invert
}) {
  if (invert = !!invert) domain = reverse(domain);
  scale.domain(domain).align(align).round(round);
  return {type: "ordinal", invert, domain, range, scale};
}

export function ScalePoint(encodings, {padding = 0.5, ...options}) {
  return ScaleO(scalePoint().padding(padding), encodings, options);
}

export function ScaleBand(encodings, {
  padding = 0.1,
  paddingInner = padding,
  paddingOuter = padding,
  ...options
}) {
  return ScaleO(
    scaleBand()
      .paddingInner(paddingInner)
      .paddingOuter(paddingOuter),
    encodings,
    options
  );
}

function inferDomain(encodings) {
  const domain = new Set();
  for (const {value} of encodings) {
    for (const v of value) {
      domain.add(v);
    }
  }
  return sort(domain);
}
