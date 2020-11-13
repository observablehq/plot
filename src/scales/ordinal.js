import {reverse, sort} from "d3-array";
import {scaleBand, scaleOrdinal, scalePoint} from "d3-scale";
import {schemeTableau10} from "d3-scale-chromatic";

export function ScaleO(scale, encodings, {
  align = 0.5,
  domain = inferDomain(encodings),
  round = true,
  range,
  invert
}) {
  if (invert = !!invert) domain = reverse(domain);
  scale.domain(domain);
  if (scale.align) scale.align(align); // TODO cleaner
  if (scale.round) scale.round(round); // TODO cleaner
  return {type: "ordinal", invert, domain, range, scale};
}

export function ScalePoint(key, encodings, {padding = 0.5, ...options}) {
  return ScaleO(
    key === "color"
      ? scaleOrdinal(schemeTableau10)
      : scalePoint().padding(padding),
    encodings,
    options
  );
}

export function ScaleBand(key, encodings, {
  padding = 0.1,
  paddingInner = padding,
  paddingOuter = padding,
  ...options
}) {
  return ScaleO(
    key === "color"
      ? scaleOrdinal(schemeTableau10)
      : scaleBand().paddingInner(paddingInner).paddingOuter(paddingOuter),
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
