import {InternSet, quantize, reverse as reverseof, sort, symbols} from "d3";
import {scaleBand, scaleOrdinal, scalePoint, scaleImplicit} from "d3";
import {ordinalScheme, quantitativeScheme} from "./schemes.js";
import {ascendingDefined} from "../defined.js";
import {registry, color, symbol} from "./index.js";
import {maybeSymbol} from "./symbol.js";

export function ScaleO(scale, channels, {
  type,
  domain = inferDomain(channels),
  range,
  reverse,
  hint
}) {
  if (type === "categorical") type = "ordinal"; // shorthand for color schemes
  if (reverse) domain = reverseof(domain);
  scale.domain(domain);
  if (range !== undefined) {
    // If the range is specified as a function, pass it the domain.
    if (typeof range === "function") range = range(domain);
    scale.range(range);
  }
  return {type, domain, range, scale, hint};
}

export function ScaleOrdinal(key, channels, {
  type,
  range,
  scheme = range === undefined ? type === "ordinal" ? "turbo" : "tableau10" : undefined,
  unknown,
  ...options
}) {
  let hint;
  if (registry.get(key) === symbol) {
    hint = inferSymbolHint(channels);
    range = range === undefined ? inferSymbolRange(hint) : Array.from(range, maybeSymbol);
  } else if (registry.get(key) === color && scheme !== undefined) {
    if (range !== undefined) {
      const interpolate = quantitativeScheme(scheme);
      const t0 = range[0], d = range[1] - range[0];
      range = ({length: n}) => quantize(t => interpolate(t0 + d * t), n);
    } else {
      range = ordinalScheme(scheme);
    }
  }
  if (unknown === scaleImplicit) throw new Error("implicit unknown is not supported");
  return ScaleO(scaleOrdinal().unknown(unknown), channels, {...options, type, range, hint});
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

// If all channels provide a consistent hint, propagate it to the scale.
function inferSymbolHint(channels) {
  const hint = {};
  for (const {hint: {fill, stroke}} of channels) {
    if (!("fill" in hint)) hint.fill = fill;
    else if (hint.fill !== fill) hint.fill = undefined;
    if (!("stroke" in hint)) hint.stroke = stroke;
    else if (hint.stroke !== stroke) hint.stroke = undefined;
  }
  return hint;
}

// TODO If the symbols will be filled, prefer the filled symbol set.
function inferSymbolRange(hint) {
  if (hint.fill !== "none") {
    console.debug("TODO prefer filled symbols");
  } else {
    console.debug("TODO prefer stroked symbols");
  }
  return symbols;
}
