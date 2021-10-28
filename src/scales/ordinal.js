import {InternSet, quantize, reverse as reverseof, sort} from "d3";
import {scaleBand, scaleOrdinal, scalePoint, scaleImplicit} from "d3";
import {ordinalScheme, quantitativeScheme} from "./schemes.js";
import {ascendingDefined} from "../defined.js";
import {registry, color} from "./index.js";

export function ScaleO(scale, channels, {
  type,
  domain = inferDomain(channels),
  range,
  reverse
}) {
  if (type === "categorical") type = "ordinal"; // shorthand for color schemes
  if (reverse) domain = reverseof(domain);
  scale.domain(domain);
  if (range !== undefined) {
    // If the range is specified as a function, pass it the domain.
    if (typeof range === "function") range = range(domain);
    scale.range(range);
  }
  return {type, domain, range, scale};
}

export function ScaleOrdinal(key, channels, {
  type,
  range,
  scheme = range === undefined ? type === "ordinal" ? "turbo" : "tableau10" : undefined,
  unknown,
  ...options
}) {
  if (registry.get(key) === color && scheme !== undefined) {
    if (range !== undefined) {
      const interpolate = quantitativeScheme(scheme);
      const t0 = range[0], d = range[1] - range[0];
      range = ({length: n}) => quantize(t => interpolate(t0 + d * t), n);
    } else {
      range = ordinalScheme(scheme);
    }
  }
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
