import {InternSet, extent, quantize, reverse as reverseof, sort, symbolsFill, symbolsStroke} from "d3";
import {scaleBand, scaleOrdinal, scalePoint, scaleImplicit} from "d3";
import {ascendingDefined} from "../defined.js";
import {isNoneish, map} from "../options.js";
import {maybeInterval} from "../transforms/interval.js";
import {maybeSymbol} from "../symbols.js";
import {registry, color, position, symbol} from "./index.js";
import {maybeBooleanRange, ordinalScheme, quantitativeScheme} from "./schemes.js";

// This denotes an implicitly ordinal color scale: the scale type was not set,
// but the associated values are strings or booleans. If the associated defined
// values are entirely boolean, the range will default to greys. You can opt out
// of this by setting the type explicitly.
export const ordinalImplicit = Symbol("ordinal");

function ScaleO(key, scale, channels, {type, interval, domain, range, reverse, hint}) {
  interval = maybeInterval(interval);
  if (domain === undefined) domain = inferDomain(channels, interval, key);
  if (type === "categorical" || type === ordinalImplicit) type = "ordinal"; // shorthand for color schemes
  if (reverse) domain = reverseof(domain);
  scale.domain(domain);
  if (range !== undefined) {
    // If the range is specified as a function, pass it the domain.
    if (typeof range === "function") range = range(domain);
    scale.range(range);
  }
  return {type, domain, range, scale, hint, interval};
}

export function ScaleOrdinal(key, channels, {type, interval, domain, range, scheme, unknown, ...options}) {
  interval = maybeInterval(interval);
  if (domain === undefined) domain = inferDomain(channels, interval, key);
  let hint;
  if (registry.get(key) === symbol) {
    hint = inferSymbolHint(channels);
    range = range === undefined ? inferSymbolRange(hint) : map(range, maybeSymbol);
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
        const t0 = range[0],
          d = range[1] - range[0];
        range = ({length: n}) => quantize((t) => interpolate(t0 + d * t), n);
      } else {
        range = ordinalScheme(scheme);
      }
    }
  }
  if (unknown === scaleImplicit) throw new Error("implicit unknown is not supported");
  return ScaleO(key, scaleOrdinal().unknown(unknown), channels, {...options, type, domain, range, hint});
}

export function ScalePoint(key, channels, {align = 0.5, padding = 0.5, ...options}) {
  return maybeRound(scalePoint().align(align).padding(padding), channels, options, key);
}

export function ScaleBand(
  key,
  channels,
  {
    align = 0.5,
    padding = 0.1,
    paddingInner = padding,
    paddingOuter = key === "fx" || key === "fy" ? 0 : padding,
    ...options
  }
) {
  return maybeRound(
    scaleBand().align(align).paddingInner(paddingInner).paddingOuter(paddingOuter),
    channels,
    options,
    key
  );
}

function maybeRound(scale, channels, options, key) {
  let {round} = options;
  if (round !== undefined) scale.round((round = !!round));
  scale = ScaleO(key, scale, channels, options);
  scale.round = round; // preserve for autoScaleRound
  return scale;
}

function inferDomain(channels, interval, key) {
  const values = new InternSet();
  for (const {value, domain} of channels) {
    if (domain !== undefined) return domain(); // see channelDomain
    if (value === undefined) continue;
    for (const v of value) values.add(v);
  }
  if (interval !== undefined) {
    const [min, max] = extent(values).map(interval.floor, interval);
    return interval.range(min, interval.offset(max));
  }
  if (values.size > 10e3 && registry.get(key) === position)
    throw new Error("implicit ordinal position domain has more than 10,000 values");
  return sort(values, ascendingDefined);
}

// If all channels provide a consistent hint, propagate it to the scale.
function inferHint(channels, key) {
  let value;
  for (const {hint} of channels) {
    const candidate = hint?.[key];
    if (candidate === undefined) continue; // no hint here
    if (value === undefined) value = candidate;
    // first hint
    else if (value !== candidate) return; // inconsistent hint
  }
  return value;
}

function inferSymbolHint(channels) {
  return {
    fill: inferHint(channels, "fill"),
    stroke: inferHint(channels, "stroke")
  };
}

function inferSymbolRange(hint) {
  return isNoneish(hint.fill) ? symbolsStroke : symbolsFill;
}
