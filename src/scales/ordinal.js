import {reverse, sort} from "d3-array";
import {scaleBand, scaleOrdinal, scalePoint} from "d3-scale";
import {schemeTableau10} from "d3-scale-chromatic";
import {ascendingDefined} from "../defined.js";
import {registry, color} from "./index.js";

export function ScaleO(scale, channels, {
  domain = inferDomain(channels),
  range,
  invert,
  inset
}) {
  if (invert = !!invert) domain = reverse(domain);
  scale.domain(domain);
  if (range !== undefined) scale.range(range);
  return {type: "ordinal", invert, domain, range, scale, inset};
}

export function ScaleOrdinal(key, channels, {
  range = registry.get(key) === color ? schemeTableau10 : undefined,
  ...options
}) {
  return ScaleO(scaleOrdinal(range), channels, {range, ...options});
}

export function ScalePoint(key, channels, {
  align = 0.5,
  padding = 0.5,
  round = true,
  ...options
}) {
  return ScaleO(
    scalePoint()
      .align(align)
      .padding(padding)
      .round(round),
    channels,
    options
  );
}

export function ScaleBand(key, channels, {
  align = 0.5,
  padding = 0.1,
  paddingInner = padding,
  paddingOuter = padding,
  round = true,
  ...options
}) {
  return ScaleO(
    scaleBand()
      .align(align)
      .paddingInner(paddingInner)
      .paddingOuter(paddingOuter)
      .round(round),
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
