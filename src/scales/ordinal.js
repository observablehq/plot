import {reverse, sort} from "d3-array";
import {scaleBand, scaleOrdinal, scalePoint} from "d3-scale";
import {schemeTableau10} from "d3-scale-chromatic";
import {ascendingDefined} from "../defined.js";
import {registry, color} from "./index.js";

export function ScaleO(scale, channels, {
  align = 0.5,
  domain = inferDomain(channels),
  round = true,
  range,
  invert,
  inset
}) {
  if (invert = !!invert) domain = reverse(domain);
  scale.domain(domain);
  if (scale.align) scale.align(align); // TODO cleaner
  if (scale.round) scale.round(round); // TODO cleaner
  if (range !== undefined) scale.range(range);
  return {type: "ordinal", invert, domain, range, scale, inset};
}

export function ScaleOrdinal(key, channels, {
  range = registry.get(key) === color ? schemeTableau10 : undefined,
  ...options
}) {
  return ScaleO(scaleOrdinal(range), channels, {range, ...options});
}

export function ScalePoint(key, channels, {padding = 0.5, ...options}) {
  return ScaleO(
    scalePoint().padding(padding),
    channels,
    options
  );
}

export function ScaleBand(key, channels, {
  padding = 0.1,
  paddingInner = padding,
  paddingOuter = padding,
  ...options
}) {
  return ScaleO(
    scaleBand().paddingInner(paddingInner).paddingOuter(paddingOuter),
    channels,
    options
  );
}

function inferDomain(channels) {
  const domain = new Set();
  for (const {value} of channels) {
    if (value === undefined) continue;
    for (const v of value) domain.add(v);
  }
  return sort(domain, ascendingDefined);
}
