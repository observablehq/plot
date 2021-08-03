import {InternSet, reverse as reverseof, sort} from "d3";
import {scaleBand, scaleOrdinal, scalePoint} from "d3";
import {ordinalScheme} from "./schemes.js";
import {ascendingDefined} from "../defined.js";
import {registry, color} from "./index.js";

export function ScaleO(scale, channels, {
  domain = inferDomain(channels),
  range,
  reverse,
  inset
}) {
  if (reverse = !!reverse) domain = reverseof(domain);
  scale.domain(domain);
  if (range !== undefined) {
    // If the range is specified as a function, pass it the domain.
    if (typeof range === "function") range = range(domain);
    scale.range(range);
  }
  return {type: "ordinal", reverse, domain, range, scale, inset};
}

export function ScaleOrdinal(key, channels, {
  type,
  scheme = type === "ordinal" ? "turbo" : "tableau10", // ignored if not color
  range = registry.get(key) === color ? ordinalScheme(scheme) : undefined,
  ...options
}) {
  return ScaleO(scaleOrdinal().unknown(undefined), channels, {range, ...options});
}

export function ScalePoint(key, channels, {
  align = 0.5,
  padding = 0.5,
  ...options
}) {
  return maybeRound(
    scalePoint()
      .align(align)
      .padding(padding),
    channels,
    options
  );
}

export function ScaleBand(key, channels, {
  align = 0.5,
  padding = 0.1,
  paddingInner = padding,
  paddingOuter = key === "fx" || key === "fy" ? 0 : padding,
  ...options
}) {
  return maybeRound(
    scaleBand()
      .align(align)
      .paddingInner(paddingInner)
      .paddingOuter(paddingOuter),
    channels,
    options
  );
}

function maybeRound(scale, channels, options = {}) {
  const {round} = options;
  if (round !== undefined) scale.round(round);
  scale = ScaleO(scale, channels, options);
  scale.round = round;
  return scale;
}

function inferDomain(channels) {
  const domain = new InternSet();
  for (const {value} of channels) {
    if (value === undefined) continue;
    for (const v of value) domain.add(v);
  }
  return sort(domain, ascendingDefined);
}
