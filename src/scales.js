import {
  isOrdinal,
  isTemporal,
  isTemporalString,
  isNumericString,
  isScaleOptions,
  map,
  slice,
  coerceNumbers,
  coerceDates
} from "./options.js";
import {registry, color, position, radius, opacity, symbol, length} from "./scales/index.js";
import {
  createScaleLinear,
  createScaleSqrt,
  createScalePow,
  createScaleLog,
  createScaleSymlog,
  createScaleQuantile,
  createScaleQuantize,
  createScaleThreshold,
  createScaleIdentity
} from "./scales/quantitative.js";
import {
  createScaleDiverging,
  createScaleDivergingSqrt,
  createScaleDivergingPow,
  createScaleDivergingLog,
  createScaleDivergingSymlog
} from "./scales/diverging.js";
import {isCategoricalScheme, isDivergingScheme} from "./scales/schemes.js";
import {createScaleTime, createScaleUtc} from "./scales/temporal.js";
import {createScaleOrdinal, createScalePoint, createScaleBand, ordinalImplicit} from "./scales/ordinal.js";
import {maybeSymbol} from "./symbol.js";
import {warn} from "./warnings.js";

export function createScales(
  channelsByScale,
  {
    label: globalLabel,
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
    projection,
    facet: {label: facetLabel = globalLabel} = {},
    ...options
  } = {}
) {
  const scales = {};
  for (const [key, channels] of channelsByScale) {
    const scaleOptions = options[key];
    const scale = createScale(key, channels, {
      round: registry.get(key) === position ? round : undefined, // only for position
      nice,
      clamp,
      zero,
      align,
      padding,
      projection,
      ...scaleOptions
    });
    if (scale) {
      // populate generic scale options (percent, transform, insets)
      let {
        label = key === "fx" || key === "fy" ? facetLabel : globalLabel,
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
      scale.label = label === undefined ? inferScaleLabel(channels, scale) : label;
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

export function createScaleFunctions(descriptors) {
  const scales = {};
  const scaleFunctions = {scales};
  for (const [key, descriptor] of Object.entries(descriptors)) {
    const {scale, type, interval, label} = descriptor;
    scales[key] = exposeScale(descriptor);
    scaleFunctions[key] = scale;
    // TODO: pass these properties, which are needed for axes, in the descriptor.
    scale.type = type;
    if (interval != null) scale.interval = interval;
    if (label != null) scale.label = label;
  }
  return scaleFunctions;
}

// Mutates scale.range!
export function autoScaleRange(scales, dimensions) {
  const {x, y, fx, fy} = scales;
  const superdimensions = fx || fy ? outerDimensions(dimensions) : dimensions;
  if (fx) autoScaleRangeX(fx, superdimensions);
  if (fy) autoScaleRangeY(fy, superdimensions);
  const subdimensions = fx || fy ? innerDimensions(scales, dimensions) : dimensions;
  if (x) autoScaleRangeX(x, subdimensions);
  if (y) autoScaleRangeY(y, subdimensions);
}

// Channels can have labels; if all the channels for a given scale are
// consistently labeled (i.e., have the same value if not undefined), and the
// corresponding scale doesn’t already have an explicit label, then the
// channels’ label is promoted to the scale. This inferred label should have an
// orientation-appropriate arrow added when used as an axis, but we don’t want
// to add the arrow when the label is set explicitly as an option; so, the
// inferred label is distinguished as an object with an “inferred” property.
function inferScaleLabel(channels = [], scale) {
  let label;
  for (const {label: l} of channels) {
    if (l === undefined) continue;
    if (label === undefined) label = l;
    else if (label !== l) return;
  }
  if (label === undefined) return;
  if (!isOrdinalScale(scale) && scale.percent) label = `${label} (%)`;
  return {inferred: true, toString: () => label};
}

// Returns the dimensions of the outer frame; this is subdivided into facets
// with the margins of each facet collapsing into the outer margins.
export function outerDimensions(dimensions) {
  const {
    marginTop,
    marginRight,
    marginBottom,
    marginLeft,
    width,
    height,
    facet: {
      marginTop: facetMarginTop,
      marginRight: facetMarginRight,
      marginBottom: facetMarginBottom,
      marginLeft: facetMarginLeft
    }
  } = dimensions;
  return {
    marginTop: Math.max(marginTop, facetMarginTop),
    marginRight: Math.max(marginRight, facetMarginRight),
    marginBottom: Math.max(marginBottom, facetMarginBottom),
    marginLeft: Math.max(marginLeft, facetMarginLeft),
    width,
    height
  };
}

// Returns the dimensions of each facet.
export function innerDimensions({fx, fy}, dimensions) {
  const {marginTop, marginRight, marginBottom, marginLeft, width, height} = outerDimensions(dimensions);
  return {
    marginTop,
    marginRight,
    marginBottom,
    marginLeft,
    width: fx ? fx.scale.bandwidth() + marginLeft + marginRight : width,
    height: fy ? fy.scale.bandwidth() + marginTop + marginBottom : height,
    facet: {width, height}
  };
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
  return Array.from({length}, (_, i) => start + (i / (length - 1)) * (end - start));
}

export function normalizeScale(key, scale, hint) {
  return createScale(key, hint === undefined ? undefined : [{hint}], {...scale});
}

function createScale(key, channels = [], options = {}) {
  const type = inferScaleType(key, channels, options);

  // Warn for common misuses of implicit ordinal scales. We disable this test if
  // you specify a scale interval or if you set the domain or range explicitly,
  // since setting the domain or range (typically with a cardinality of more than
  // two) is another indication that you intended for the scale to be ordinal; we
  // also disable it for facet scales since these are always band scales.
  if (
    options.type === undefined &&
    options.domain === undefined &&
    options.range === undefined &&
    options.interval == null &&
    key !== "fx" &&
    key !== "fy" &&
    isOrdinalScale({type})
  ) {
    const values = channels.map(({value}) => value).filter((value) => value !== undefined);
    if (values.some(isTemporal))
      warn(
        `Warning: some data associated with the ${key} scale are dates. Dates are typically associated with a "utc" or "time" scale rather than a "${formatScaleType(
          type
        )}" scale. If you are using a bar mark, you probably want a rect mark with the interval option instead; if you are using a group transform, you probably want a bin transform instead. If you want to treat this data as ordinal, you can specify the interval of the ${key} scale (e.g., d3.utcDay), or you can suppress this warning by setting the type of the ${key} scale to "${formatScaleType(
          type
        )}".`
      );
    else if (values.some(isTemporalString))
      warn(
        `Warning: some data associated with the ${key} scale are strings that appear to be dates (e.g., YYYY-MM-DD). If these strings represent dates, you should parse them to Date objects. Dates are typically associated with a "utc" or "time" scale rather than a "${formatScaleType(
          type
        )}" scale. If you are using a bar mark, you probably want a rect mark with the interval option instead; if you are using a group transform, you probably want a bin transform instead. If you want to treat this data as ordinal, you can suppress this warning by setting the type of the ${key} scale to "${formatScaleType(
          type
        )}".`
      );
    else if (values.some(isNumericString))
      warn(
        `Warning: some data associated with the ${key} scale are strings that appear to be numbers. If these strings represent numbers, you should parse or coerce them to numbers. Numbers are typically associated with a "linear" scale rather than a "${formatScaleType(
          type
        )}" scale. If you want to treat this data as ordinal, you can specify the interval of the ${key} scale (e.g., 1 for integers), or you can suppress this warning by setting the type of the ${key} scale to "${formatScaleType(
          type
        )}".`
      );
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
        case position:
          options = coerceType(channels, options, coerceNumbers);
          break;
        case symbol:
          options = coerceType(channels, options, coerceSymbols);
          break;
      }
      break;
    case "utc":
    case "time":
      options = coerceType(channels, options, coerceDates);
      break;
  }

  switch (type) {
    case "diverging":
      return createScaleDiverging(key, channels, options);
    case "diverging-sqrt":
      return createScaleDivergingSqrt(key, channels, options);
    case "diverging-pow":
      return createScaleDivergingPow(key, channels, options);
    case "diverging-log":
      return createScaleDivergingLog(key, channels, options);
    case "diverging-symlog":
      return createScaleDivergingSymlog(key, channels, options);
    case "categorical":
    case "ordinal":
    case ordinalImplicit:
      return createScaleOrdinal(key, channels, options);
    case "cyclical":
    case "sequential":
    case "linear":
      return createScaleLinear(key, channels, options);
    case "sqrt":
      return createScaleSqrt(key, channels, options);
    case "threshold":
      return createScaleThreshold(key, channels, options);
    case "quantile":
      return createScaleQuantile(key, channels, options);
    case "quantize":
      return createScaleQuantize(key, channels, options);
    case "pow":
      return createScalePow(key, channels, options);
    case "log":
      return createScaleLog(key, channels, options);
    case "symlog":
      return createScaleSymlog(key, channels, options);
    case "utc":
      return createScaleUtc(key, channels, options);
    case "time":
      return createScaleTime(key, channels, options);
    case "point":
      return createScalePoint(key, channels, options);
    case "band":
      return createScaleBand(key, channels, options);
    case "identity":
      return createScaleIdentity(key);
    case undefined:
      return;
    default:
      throw new Error(`unknown scale type: ${type}`);
  }
}

function formatScaleType(type) {
  return typeof type === "symbol" ? type.description : type;
}

// A special type symbol when the x and y scales are replaced with a projection.
const typeProjection = {toString: () => "projection"};

function inferScaleType(key, channels, {type, domain, range, scheme, pivot, projection}) {
  // The facet scales are always band scales; this cannot be changed.
  if (key === "fx" || key === "fy") return "band";

  // If a projection is specified, the x- and y-scales are disabled; these
  // channels will be projected rather than scaled. (But still check that none
  // of the associated channels are incompatible with a projection.)
  if ((key === "x" || key === "y") && projection != null) type = typeProjection;

  // If a channel dictates a scale type, make sure that it is consistent with
  // the user-specified scale type (if any) and all other channels. For example,
  // barY requires x to be a band scale and disallows any other scale type.
  for (const {type: t} of channels) {
    if (t === undefined) continue;
    else if (type === undefined) type = t;
    else if (type !== t) throw new Error(`scale incompatible with channel: ${type} !== ${t}`);
  }

  // If the scale, a channel, or user specified a (consistent) type, return it.
  if (type === typeProjection) return;
  if (type !== undefined) return type;

  // If there’s no data (and no type) associated with this scale, don’t create a scale.
  if (domain === undefined && !channels.some(({value}) => value !== undefined)) return;

  // Some scales have default types.
  const kind = registry.get(key);
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
  } else {
    const values = channels.map(({value}) => value).filter((value) => value !== undefined);
    if (values.some(isOrdinal)) return asOrdinalType(kind);
    if (values.some(isTemporal)) return "utc";
  }

  // For color scales, take a hint from the color scheme and pivot option.
  if (kind === color) {
    if (pivot != null || isDivergingScheme(scheme)) return "diverging";
    if (isCategoricalScheme(scheme)) return "categorical";
  }

  return "linear";
}

// Positional scales default to a point scale instead of an ordinal scale.
function asOrdinalType(kind) {
  switch (kind) {
    case position:
      return "point";
    case color:
      return ordinalImplicit;
    default:
      return "ordinal";
  }
}

export function isTemporalScale({type}) {
  return type === "time" || type === "utc";
}

export function isOrdinalScale({type}) {
  return type === "ordinal" || type === "point" || type === "band" || type === ordinalImplicit;
}

export function isThresholdScale({type}) {
  return type === "threshold";
}

function isBandScale({type}) {
  return type === "point" || type === "band";
}

export function isDivergingScale({type}) {
  return /^diverging($|-)/.test(type);
}

// Certain marks have special behavior if a scale is collapsed, i.e. if the
// domain is degenerate and represents only a single value such as [3, 3]; for
// example, a rect will span the full extent of the chart along a collapsed
// dimension (whereas a dot will simply be drawn in the center).
export function isCollapsed(scale) {
  if (scale === undefined) return true; // treat missing scale as collapsed
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

export function exposeScales(scales) {
  return (key) => {
    if (!registry.has((key = `${key}`))) throw new Error(`unknown scale: ${key}`);
    return scales[key];
  };
}

// Note: axis- and legend-related properties (such as label, ticks and
// tickFormat) are not included here as they do not affect the scale’s behavior.
function exposeScale({scale, type, domain, range, interpolate, interval, transform, percent, pivot}) {
  if (type === "identity") return {type: "identity", apply: (d) => d, invert: (d) => d};
  const unknown = scale.unknown ? scale.unknown() : undefined;
  return {
    type,
    domain: slice(domain), // defensive copy
    ...(range !== undefined && {range: slice(range)}), // defensive copy
    ...(transform !== undefined && {transform}),
    ...(percent && {percent}), // only exposed if truthy
    ...(unknown !== undefined && {unknown}),
    ...(interval !== undefined && {interval}),

    // quantitative
    ...(interpolate !== undefined && {interpolate}),
    ...(scale.clamp && {clamp: scale.clamp()}),

    // diverging (always asymmetric; we never want to apply the symmetric transform twice)
    ...(pivot !== undefined && {pivot, symmetric: false}),

    // log, diverging-log
    ...(scale.base && {base: scale.base()}),

    // pow, diverging-pow
    ...(scale.exponent && {exponent: scale.exponent()}),

    // symlog, diverging-symlog
    ...(scale.constant && {constant: scale.constant()}),

    // band, point
    ...(scale.align && {align: scale.align(), round: scale.round()}),
    ...(scale.padding &&
      (scale.paddingInner
        ? {paddingInner: scale.paddingInner(), paddingOuter: scale.paddingOuter()}
        : {padding: scale.padding()})),
    ...(scale.bandwidth && {bandwidth: scale.bandwidth(), step: scale.step()}),

    // utilities
    apply: (t) => scale(t),
    ...(scale.invert && {invert: (t) => scale.invert(t)})
  };
}
