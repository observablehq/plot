import {InternSet, quantize, reverse as reverseof, sort, symbolsFill, symbolsStroke} from "d3";
import {scaleBand, scaleOrdinal, scalePoint, scaleImplicit} from "d3";
import {ascendingDefined} from "../defined.js";
import {maybeSymbol, isNoneish} from "../options.js";
import {registry, color, symbol} from "./index.js";
import {maybeBooleanRange, ordinalScheme, quantitativeScheme} from "./schemes.js";

// This denotes an implicitly ordinal color scale: the scale type was not set,
// but the associated values are strings or booleans. If the associated defined
// values are entirely boolean, the range will default to greys. You can opt out
// of this by setting the type explicitly.
export const ordinalImplicit = Symbol("ordinal");

export function ScaleO(scale, channels, {
  type,
  domain = inferDomain(channels),
  range,
  reverse,
  hint
}) {
  if (type === "categorical" || type === ordinalImplicit) type = "ordinal"; // shorthand for color schemes
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
  domain = inferDomain(channels),
  range,
  scheme,
  unknown,
  ...options
}) {
  let hint;
  if (registry.get(key) === symbol) {
    hint = inferSymbolHint(channels);
    range = range === undefined ? inferSymbolRange(hint) : Array.from(range, maybeSymbol);
  } else if (registry.get(key) === color) {
    if (range === undefined && (type === "ordinal" || type === ordinalImplicit)) {
      range = maybeBooleanRange(domain, scheme);
      if (range !== undefined) scheme = undefined; // Don’t re-apply scheme.
    }
    if (scheme === undefined && range === undefined) {
      scheme = type === "ordinal" ? "turbo" : "tableau10";
    }
    if (scheme !== undefined) {
      if (range !== undefined) {
        const interpolate = quantitativeScheme(scheme);
        const t0 = range[0], d = range[1] - range[0];
        range = ({length: n}) => quantize(t => interpolate(t0 + d * t), n);
      } else {
        range = ordinalScheme(scheme);
      }
    }
  }
  if (unknown === scaleImplicit) throw new Error("implicit unknown is not supported");
  return ScaleO(scaleOrdinal().unknown(unknown), channels, {...options, type, domain, range, hint});
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
  for (const {hint: channelHint} of channels) {
    for (const key of ["fill", "stroke"]) {
      const value = channelHint[key];
      if (!(key in hint)) hint[key] = value;
      else if (hint[key] !== value) hint[key] = undefined;
    }
  }
  return hint;
}

function inferSymbolRange(hint) {
  return isNoneish(hint.fill) ? symbolsStroke : symbolsFill;
}
