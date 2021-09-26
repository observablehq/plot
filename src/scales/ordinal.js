import {InternSet, reverse as reverseof, sort} from "d3";
import {scaleBand, scaleOrdinal, scalePoint, scaleImplicit} from "d3";
import {ordinalScheme} from "./schemes.js";
import {ascendingDefined} from "../defined.js";
import {registry, color} from "./index.js";

export function ScaleO(scale, channels, {
  type,
  domain = inferDomain(channels),
  range,
  reverse,
  inset = 0
}) {
  if (type === "categorical") type = "ordinal"; // shorthand for color schemes
  if (reverse) domain = reverseof(domain);
  inset = +inset;
  scale.domain(domain);
  if (range !== undefined) {
    // If the range is specified as a function, pass it the domain.
    if (typeof range === "function") range = range(domain);
    scale.range(range);
  }
  return {type, domain, range, scale, inset};
}

export function ScaleOrdinal(key, channels, {
  type,
  scheme = type === "ordinal" ? "turbo" : "tableau10", // ignored if not color
  range = registry.get(key) === color ? ordinalScheme(scheme) : undefined,
  unknown,
  ...options
}) {
  if (unknown === scaleImplicit) throw new Error("implicit unknown is not supported");
  return ScaleO(scaleOrdinal().unknown(unknown), channels, {type, range, ...options});
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

function maybeRound(scale, channels, options) {
  let {round} = options;
  if (round !== undefined) scale.round(round = !!round);
  scale = ScaleO(scale, channels, options);
  scale.round = round; // preserve for autoScaleRound
  return scale;
}

function inferDomain(channels) {
  const values = new InternSet();
  for (const {value, domain} of channels) {
    if (domain !== undefined) return domain();
    if (value === undefined) continue;
    for (const v of value) values.add(v);
  }
  return sort(values, ascendingDefined);
}
