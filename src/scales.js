import {parse as isoParse} from "isoformat";
import {isColor, isEvery, isOrdinal, isFirst, isTemporal, isTemporalString, isNumericString, isScaleOptions, isTypedArray, map, order, slice} from "./options.js";
import {registry, color, position, radius, opacity, symbol, length} from "./scales/index.js";
import {ScaleLinear, ScaleSqrt, ScalePow, ScaleLog, ScaleSymlog, ScaleQuantile, ScaleQuantize, ScaleThreshold, ScaleIdentity} from "./scales/quantitative.js";
import {ScaleDiverging, ScaleDivergingSqrt, ScaleDivergingPow, ScaleDivergingLog, ScaleDivergingSymlog} from "./scales/diverging.js";
import {isDivergingScheme} from "./scales/schemes.js";
import {ScaleTime, ScaleUtc} from "./scales/temporal.js";
import {ScaleOrdinal, ScalePoint, ScaleBand, ordinalImplicit} from "./scales/ordinal.js";
import {isSymbol, maybeSymbol} from "./symbols.js";
import {warn} from "./warnings.js";

export function Scales(channelsByScale, {
  inset: globalInset = 0,
  insetTop: globalInsetTop = globalInset,
  insetRight: globalInsetRight = globalInset,
  insetBottom: globalInsetBottom = globalInset,
  insetLeft: globalInsetLeft = globalInset,
  round,
  nice,
  clamp,
  zero,
  align,
  padding,
  ...options
} = {}) {
  const scales = {};
  for (const [key, channels] of channelsByScale) {
    const scaleOptions = options[key];
    const scale = Scale(key, channels, {
      round: registry.get(key) === position ? round : undefined, // only for position
      nice,
      clamp,
      zero,
      align,
      padding,
      ...scaleOptions
    });
    if (scale) {
      // populate generic scale options (percent, transform, insets)
      let {
        percent,
        transform,
        inset,
        insetTop = inset !== undefined ? inset : key === "y" ? globalInsetTop : 0, // not fy
        insetRight = inset !== undefined ? inset : key === "x" ? globalInsetRight : 0, // not fx
        insetBottom = inset !== undefined ? inset : key === "y" ? globalInsetBottom : 0, // not fy
        insetLeft = inset !== undefined ? inset : key === "x" ? globalInsetLeft : 0 // not fx
      } = scaleOptions || {};
      if (transform == null) transform = undefined;
      else if (typeof transform !== "function") throw new Error("invalid scale transform; not a function");
      scale.percent = !!percent;
      scale.transform = transform;
      if (key === "x" || key === "fx") {
        scale.insetLeft = +insetLeft;
        scale.insetRight = +insetRight;
      } else if (key === "y" || key === "fy") {
        scale.insetTop = +insetTop;
        scale.insetBottom = +insetBottom;
      }
      scales[key] = scale;
    }
  }
  return scales;
}

export function ScaleFunctions(scales) {
  return Object.fromEntries(Object.entries(scales).map(([name, {scale}]) => [name, scale]));
}

// Mutates scale.range!
export function autoScaleRange({x, y, fx, fy}, dimensions) {
  if (fx) autoScaleRangeX(fx, dimensions);
  if (fy) autoScaleRangeY(fy, dimensions);
  if (x) autoScaleRangeX(x, fx ? {width: fx.scale.bandwidth()} : dimensions);
  if (y) autoScaleRangeY(y, fy ? {height: fy.scale.bandwidth()} : dimensions);
}

function autoScaleRangeX(scale, dimensions) {
  if (scale.range === undefined) {
    const {insetLeft, insetRight} = scale;
    const {width, marginLeft = 0, marginRight = 0} = dimensions;
    const left = marginLeft + insetLeft;
    const right = width - marginRight - insetRight;
    scale.range = [left, Math.max(left, right)];
    if (!isOrdinalScale(scale)) scale.range = piecewiseRange(scale);
    scale.scale.range(scale.range);
  }
  autoScaleRound(scale);
}

function autoScaleRangeY(scale, dimensions) {
  if (scale.range === undefined) {
    const {insetTop, insetBottom} = scale;
    const {height, marginTop = 0, marginBottom = 0} = dimensions;
    const top = marginTop + insetTop;
    const bottom = height - marginBottom - insetBottom;
    scale.range = [Math.max(top, bottom), top];
    if (!isOrdinalScale(scale)) scale.range = piecewiseRange(scale);
    else scale.range.reverse();
    scale.scale.range(scale.range);
  }
  autoScaleRound(scale);
}

function autoScaleRound(scale) {
  if (scale.round === undefined && isBandScale(scale) && roundError(scale) <= 30) {
    scale.scale.round(true);
  }
}

// If we were to turn on rounding for this band or point scale, how much wasted
// space would it introduce (on both ends of the range)? This must match
// d3.scaleBand’s rounding behavior:
// https://github.com/d3/d3-scale/blob/83555bd759c7314420bd4240642beda5e258db9e/src/band.js#L20-L32
function roundError({scale}) {
  const n = scale.domain().length;
  const [start, stop] = scale.range();
  const paddingInner = scale.paddingInner ? scale.paddingInner() : 1;
  const paddingOuter = scale.paddingOuter ? scale.paddingOuter() : scale.padding();
  const m = n - paddingInner;
  const step = Math.abs(stop - start) / Math.max(1, m + paddingOuter * 2);
  return (step - Math.floor(step)) * m;
}

function piecewiseRange(scale) {
  const length = scale.scale.domain().length + isThresholdScale(scale);
  if (!(length > 2)) return scale.range;
  const [start, end] = scale.range;
  return Array.from({length}, (_, i) => start + i / (length - 1) * (end - start));
}

export function normalizeScale(key, scale, hint) {
  return Scale(key, hint === undefined ? undefined : [{hint}], {...scale});
}

function Scale(key, channels = [], options = {}) {
  const type = inferScaleType(key, channels, options);

  // Warn for common misuses of implicit ordinal scales. We disable this test if
  // you specify a scale interval or if you set the domain or range explicitly,
  // since setting the domain or range (typically with a cardinality of more than
  // two) is another indication that you intended for the scale to be ordinal; we
  // also disable it for facet scales since these are always band scales.
  if (options.type === undefined
      && options.domain === undefined
      && options.range === undefined
      && options.interval == null
      && key !== "fx"
      && key !== "fy"
      && isOrdinalScale({type})) {
    const values = channels.map(({value}) => value).filter(value => value !== undefined);
    if (values.some(isTemporal)) warn(`Warning: some data associated with the ${key} scale are dates. Dates are typically associated with a "utc" or "time" scale rather than a "${formatScaleType(type)}" scale. If you are using a bar mark, you probably want a rect mark with the interval option instead; if you are using a group transform, you probably want a bin transform instead. If you want to treat this data as ordinal, you can specify the interval of the ${key} scale (e.g., d3.utcDay), or you can suppress this warning by setting the type of the ${key} scale to "${formatScaleType(type)}".`);
    else if (values.some(isTemporalString)) warn(`Warning: some data associated with the ${key} scale are strings that appear to be dates (e.g., YYYY-MM-DD). If these strings represent dates, you should parse them to Date objects. Dates are typically associated with a "utc" or "time" scale rather than a "${formatScaleType(type)}" scale. If you are using a bar mark, you probably want a rect mark with the interval option instead; if you are using a group transform, you probably want a bin transform instead. If you want to treat this data as ordinal, you can suppress this warning by setting the type of the ${key} scale to "${formatScaleType(type)}".`);
    else if (values.some(isNumericString)) warn(`Warning: some data associated with the ${key} scale are strings that appear to be numbers. If these strings represent numbers, you should parse or coerce them to numbers. Numbers are typically associated with a "linear" scale rather than a "${formatScaleType(type)}" scale. If you want to treat this data as ordinal, you can specify the interval of the ${key} scale (e.g., 1 for integers), or you can suppress this warning by setting the type of the ${key} scale to "${formatScaleType(type)}".`);
  }

  options.type = type; // Mutates input!

  // Once the scale type is known, coerce the associated channel values and any
  // explicitly-specified domain to the expected type.
  switch (type) {
    case "diverging":
    case "diverging-sqrt":
    case "diverging-pow":
    case "diverging-log":
    case "diverging-symlog":
    case "cyclical":
    case "sequential":
    case "linear":
    case "sqrt":
    case "threshold":
    case "quantile":
    case "pow":
    case "log":
    case "symlog":
      options = coerceType(channels, options, coerceNumbers);
      break;
    case "identity":
      switch (registry.get(key)) {
        case position: options = coerceType(channels, options, coerceNumbers); break;
        case symbol: options = coerceType(channels, options, coerceSymbols); break;
      }
      break;
    case "utc":
    case "time":
      options = coerceType(channels, options, coerceDates);
      break;
  }

  switch (type) {
    case "diverging": return ScaleDiverging(key, channels, options);
    case "diverging-sqrt": return ScaleDivergingSqrt(key, channels, options);
    case "diverging-pow": return ScaleDivergingPow(key, channels, options);
    case "diverging-log": return ScaleDivergingLog(key, channels, options);
    case "diverging-symlog": return ScaleDivergingSymlog(key, channels, options);
    case "categorical": case "ordinal": case ordinalImplicit: return ScaleOrdinal(key, channels, options);
    case "cyclical": case "sequential": case "linear": return ScaleLinear(key, channels, options);
    case "sqrt": return ScaleSqrt(key, channels, options);
    case "threshold": return ScaleThreshold(key, channels, options);
    case "quantile": return ScaleQuantile(key, channels, options);
    case "quantize": return ScaleQuantize(key, channels, options);
    case "pow": return ScalePow(key, channels, options);
    case "log": return ScaleLog(key, channels, options);
    case "symlog": return ScaleSymlog(key, channels, options);
    case "utc": return ScaleUtc(key, channels, options);
    case "time": return ScaleTime(key, channels, options);
    case "point": return ScalePoint(key, channels, options);
    case "band": return ScaleBand(key, channels, options);
    case "identity": return registry.get(key) === position ? ScaleIdentity() : {type: "identity"};
    case undefined: return;
    default: throw new Error(`unknown scale type: ${type}`);
  }
}

function formatScaleType(type) {
  return typeof type === "symbol" ? type.description : type;
}

function inferScaleType(key, channels, {type, domain, range, scheme, pivot}) {
  // The facet scales are always band scales; this cannot be changed.
  if (key === "fx" || key === "fy") return "band";

  // If a channel dictates a scale type, make sure that it is consistent with
  // the user-specified scale type (if any) and all other channels. For example,
  // barY requires x to be a band scale and disallows any other scale type.
  for (const {type: t} of channels) {
    if (t === undefined) continue;
    else if (type === undefined) type = t;
    else if (type !== t) throw new Error(`scale incompatible with channel: ${type} !== ${t}`);
  }

  // If the scale, a channel, or user specified a (consistent) type, return it.
  if (type !== undefined) return type;

  // If there’s no data (and no type) associated with this scale, don’t create a scale.
  if (domain === undefined && !channels.some(({value}) => value !== undefined)) return;

  const kind = registry.get(key);

  // For color scales, if no range or scheme is specified and all associated
  // defined values (from the domain if present, and otherwise from channels)
  // are valid colors, then default to the identity scale. This allows, for
  // example, a fill channel to return literal colors; without this, the colors
  // would be remapped to a categorical scheme!
  if (kind === color
    && range === undefined
    && scheme === undefined
    && isAll(domain, channels, isColor)) return "identity";

  // Similarly for symbols…
  if (kind === symbol
    && range === undefined
    && isAll(domain, channels, isSymbol)) return "identity";

  // Some scales have default types.
  if (kind === radius) return "sqrt";
  if (kind === opacity || kind === length) return "linear";
  if (kind === symbol) return "ordinal";

  // If the domain or range has more than two values, assume it’s ordinal. You
  // can still use a “piecewise” (or “polylinear”) scale, but you must set the
  // type explicitly.
  if ((domain || range || []).length > 2) return asOrdinalType(kind);

  // Otherwise, infer the scale type from the data! Prefer the domain, if
  // present, over channels. (The domain and channels should be consistently
  // typed, and the domain is more explicit and typically much smaller.) We only
  // check the first defined value for expedience and simplicity; we expect
  // that the types are consistent.
  if (domain !== undefined) {
    if (isOrdinal(domain)) return asOrdinalType(kind);
    if (isTemporal(domain)) return "utc";
    if (kind === color && (pivot != null || isDivergingScheme(scheme))) return "diverging";
    return "linear";
  }

  // If any channel is ordinal or temporal, it takes priority.
  const values = channels.map(({value}) => value).filter(value => value !== undefined);
  if (values.some(isOrdinal)) return asOrdinalType(kind);
  if (values.some(isTemporal)) return "utc";
  if (kind === color && (pivot != null || isDivergingScheme(scheme))) return "diverging";
  return "linear";
}

// Positional scales default to a point scale instead of an ordinal scale.
function asOrdinalType(kind) {
  switch (kind) {
    case position: return "point";
    case color: return ordinalImplicit;
    default: return "ordinal";
  }
}

function isAll(domain, channels, is) {
  return domain !== undefined
    ? isFirst(domain, is) && isEvery(domain, is)
    : channels.some(({value}) => value !== undefined && isFirst(value, is))
      && channels.every(({value}) => value === undefined || isEvery(value, is));
}

export function isTemporalScale({type}) {
  return type === "time" || type === "utc";
}

export function isOrdinalScale({type}) {
  return type === "ordinal" || type === "point" || type === "band" || type === ordinalImplicit;
}

function isThresholdScale({type}) {
  return type === "threshold";
}

function isBandScale({type}) {
  return type === "point" || type === "band";
}

export function isDivergingScale({type}) {
  return /^diverging($|-)/.test(type);
}

// If the domain is undefined, we assume an identity scale.
export function scaleOrder({range, domain = range}) {
  return Math.sign(order(domain)) * Math.sign(order(range));
}

// Certain marks have special behavior if a scale is collapsed, i.e. if the
// domain is degenerate and represents only a single value such as [3, 3]; for
// example, a rect will span the full extent of the chart along a collapsed
// dimension (whereas a dot will simply be drawn in the center).
export function isCollapsed(scale) {
  const domain = scale.domain();
  const value = scale(domain[0]);
  for (let i = 1, n = domain.length; i < n; ++i) {
    if (scale(domain[i]) - value) {
      return false;
    }
  }
  return true;
}

// Mutates channel.value!
function coerceType(channels, {domain, ...options}, coerceValues) {
  for (const c of channels) {
    if (c.value !== undefined) {
      c.value = coerceValues(c.value);
    }
  }
  return {
    domain: domain === undefined ? domain : coerceValues(domain),
    ...options
  };
}

function coerceSymbols(values) {
  return map(values, maybeSymbol);
}

function coerceDates(values) {
  return map(values, coerceDate);
}

// If the values are specified as a typed array, no coercion is required.
export function coerceNumbers(values) {
  return isTypedArray(values) ? values : map(values, coerceNumber, Float64Array);
}

// Unlike Mark’s number, here we want to convert null and undefined to NaN,
// since the result will be stored in a Float64Array and we don’t want null to
// be coerced to zero.
export function coerceNumber(x) {
  return x == null ? NaN : +x;
}

// When coercing strings to dates, we only want to allow the ISO 8601 format
// since the built-in string parsing of the Date constructor varies across
// browsers. (In the future, this could be made more liberal if desired, though
// it is still generally preferable to do date parsing yourself explicitly,
// rather than rely on Plot.) Any non-string values are coerced to number first
// and treated as milliseconds since UNIX epoch.
export function coerceDate(x) {
  return x instanceof Date && !isNaN(x) ? x
    : typeof x === "string" ? isoParse(x)
    : x == null || isNaN(x = +x) ? undefined
    : new Date(x);
}

export function scale(options = {}) {
  let scale;
  for (const key in options) {
    if (!registry.has(key)) continue; // ignore unknown properties
    if (!isScaleOptions(options[key])) continue; // e.g., ignore {color: "red"}
    if (scale !== undefined) throw new Error("ambiguous scale definition; multiple scales found");
    scale = exposeScale(normalizeScale(key, options[key]));
  }
  if (scale === undefined) throw new Error("invalid scale definition; no scale found");
  return scale;
}

export function exposeScales(scaleDescriptors) {
  return key => {
    if (!registry.has(key = `${key}`)) throw new Error(`unknown scale: ${key}`);
    return key in scaleDescriptors ? exposeScale(scaleDescriptors[key]) : undefined;
  };
}

function exposeScale({
  scale,
  type,
  domain,
  range,
  label,
  interpolate,
  interval,
  transform,
  percent,
  pivot
}) {
  if (type === "identity") return {type: "identity", apply: d => d, invert: d => d};
  const unknown = scale.unknown ? scale.unknown() : undefined;
  return {
    type,
    domain: slice(domain), // defensive copy
    ...range !== undefined && {range: slice(range)}, // defensive copy
    ...transform !== undefined && {transform},
    ...percent && {percent}, // only exposed if truthy
    ...label !== undefined && {label},
    ...unknown !== undefined && {unknown},
    ...interval !== undefined && {interval},

    // quantitative
    ...interpolate !== undefined && {interpolate},
    ...scale.clamp && {clamp: scale.clamp()},

    // diverging (always asymmetric; we never want to apply the symmetric transform twice)
    ...pivot !== undefined && {pivot, symmetric: false},

    // log, diverging-log
    ...scale.base && {base: scale.base()},

    // pow, diverging-pow
    ...scale.exponent && {exponent: scale.exponent()},

    // symlog, diverging-symlog
    ...scale.constant && {constant: scale.constant()},

    // band, point
    ...scale.align && {align: scale.align(), round: scale.round()},
    ...scale.padding && (scale.paddingInner ? {paddingInner: scale.paddingInner(), paddingOuter: scale.paddingOuter()} : {padding: scale.padding()}),
    ...scale.bandwidth && {bandwidth: scale.bandwidth(), step: scale.step()},

    // utilities
    apply: t => scale(t),
    ...scale.invert && {invert: t => scale.invert(t)}
  };
}
