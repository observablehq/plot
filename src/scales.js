import {parse as isoParse} from "isoformat";
import {
  isColor,
  isEvery,
  isOrdinal,
  isFirst,
  isTemporal,
  isTemporalString,
  isNumericString,
  isScaleOptions,
  isTypedArray,
  map,
  order,
  slice
} from "./options.js";
import {registry, color, position, radius, opacity, symbol, length} from "./scales/index.js";
import {
  ScaleLinear,
  ScaleSqrt,
  ScalePow,
  ScaleLog,
  ScaleSymlog,
  ScaleQuantile,
  ScaleQuantize,
  ScaleThreshold,
  ScaleIdentity
} from "./scales/quantitative.js";
import {
  ScaleDiverging,
  ScaleDivergingSqrt,
  ScaleDivergingPow,
  ScaleDivergingLog,
  ScaleDivergingSymlog
} from "./scales/diverging.js";
import {isDivergingScheme} from "./scales/schemes.js";
import {ScaleTime, ScaleUtc} from "./scales/temporal.js";
import {ScaleOrdinal, ScalePoint, ScaleBand, ordinalImplicit} from "./scales/ordinal.js";
import {isSymbol, maybeSymbol} from "./symbols.js";
import {warn} from "./warnings.js";

export function Scales(
  channelsByScale,
  {
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
  } = {}
) {
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
  return Array.from({length}, (_, i) => start + (i / (length - 1)) * (end - start));
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
      return ScaleDiverging(key, channels, options);
    case "diverging-sqrt":
      return ScaleDivergingSqrt(key, channels, options);
    case "diverging-pow":
      return ScaleDivergingPow(key, channels, options);
    case "diverging-log":
      return ScaleDivergingLog(key, channels, options);
    case "diverging-symlog":
      return ScaleDivergingSymlog(key, channels, options);
    case "categorical":
    case "ordinal":
    case ordinalImplicit:
      return ScaleOrdinal(key, channels, options);
    case "cyclical":
    case "sequential":
    case "linear":
      return ScaleLinear(key, channels, options);
    case "sqrt":
      return ScaleSqrt(key, channels, options);
    case "threshold":
      return ScaleThreshold(key, channels, options);
    case "quantile":
      return ScaleQuantile(key, channels, options);
    case "quantize":
      return ScaleQuantize(key, channels, options);
    case "pow":
      return ScalePow(key, channels, options);
    case "log":
      return ScaleLog(key, channels, options);
    case "symlog":
      return ScaleSymlog(key, channels, options);
    case "utc":
      return ScaleUtc(key, channels, options);
    case "time":
      return ScaleTime(key, channels, options);
    case "point":
      return ScalePoint(key, channels, options);
    case "band":
      return ScaleBand(key, channels, options);
    case "identity":
      return registry.get(key) === position ? ScaleIdentity() : {type: "identity"};
    case undefined:
      return;
    default:
      throw new Error(`unknown scale type: ${type}`);
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
  if (kind === color && range === undefined && scheme === undefined && isAll(domain, channels, isColor))
    return "identity";

  // Similarly for symbols…
  if (kind === symbol && range === undefined && isAll(domain, channels, isSymbol)) return "identity";

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
  const values = channels.map(({value}) => value).filter((value) => value !== undefined);
  if (values.some(isOrdinal)) return asOrdinalType(kind);
  if (values.some(isTemporal)) return "utc";
  if (kind === color && (pivot != null || isDivergingScheme(scheme))) return "diverging";
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

function isAll(domain, channels, is) {
  return domain !== undefined
    ? isFirst(domain, is) && isEvery(domain, is)
    : channels.some(({value}) => value !== undefined && isFirst(value, is)) &&
        channels.every(({value}) => value === undefined || isEvery(value, is));
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

// If the domain is undefined, we assume an identity scale.
export function scaleOrder({range, domain = range}) {
  return Math.sign(order(domain)) * Math.sign(order(range));
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
  return x instanceof Date && !isNaN(x)
    ? x
    : typeof x === "string"
    ? isoParse(x)
    : x == null || isNaN((x = +x))
    ? undefined
    : new Date(x);
}

/**
 * You can also create a standalone scale with Plot.**scale**(*options*). The
 * *options* object must define at least one scale; see [Scale
 * options](https://github.com/observablehq/plot/blob/main/README.md#scale-options)
 * for how to define a scale. For example, here is a linear color scale with the
 * default domain of [0, 1] and default scheme *turbo*:
 *
 * ```js
 * const color = Plot.scale({color: {type: "linear"}});
 * ```
 *
 * #### Scale objects
 *
 * Both
 * [*plot*.scale](https://github.com/observablehq/plot/blob/main/README.md#plotscalescalename)
 * and
 * [Plot.scale](https://github.com/observablehq/plot/blob/main/README.md#plotscaleoptions)
 * return scale objects. These objects represent the actual (or “materialized”)
 * scale options used by Plot, including the domain, range, interpolate
 * function, *etc.* The scale’s label, if any, is also returned; however, note
 * that other axis properties are not currently exposed. Point and band scales
 * also expose their materialized bandwidth and step.
 *
 * To reuse a scale across plots, pass the corresponding scale object into
 * another plot specification:
 *
 * ```js
 * const plot1 = Plot.plot(…);
 * const plot2 = Plot.plot({…, color: plot1.scale("color")});
 * ```
 *
 * For convenience, scale objects expose a *scale*.**apply**(*input*) method
 * which returns the scale’s output for the given *input* value. When
 * applicable, scale objects also expose a *scale*.**invert**(*output*) method
 * which returns the corresponding input value from the scale’s domain for the
 * given *output* value.
 *
 * ### Position options
 *
 * The position scales (*x*, *y*, *fx*, and *fy*) support additional options:
 *
 * * *scale*.**inset** - inset the default range by the specified amount in
 *   pixels
 * * *scale*.**round** - round the output value to the nearest integer (whole
 *   pixel)
 *
 * The *x* and *fx* scales support asymmetric insets for more precision. Replace
 * inset by:
 *
 * * *scale*.**insetLeft** - insets the start of the default range by the
 *   specified number of pixels
 * * *scale*.**insetRight** - insets the end of the default range by the
 *   specified number of pixels
 *
 * Similarly, the *y* and *fy* scales support asymmetric insets with:
 *
 * * *scale*.**insetTop** - insets the top of the default range by the specified
 *   number of pixels
 * * *scale*.**insetBottom** - insets the bottom of the default range by the
 *   specified number of pixels
 *
 * The inset scale options can provide “breathing room” to separate marks from
 * axes or the plot’s edge. For example, in a scatterplot with a Plot.dot with
 * the default 3-pixel radius and 1.5-pixel stroke width, an inset of 5 pixels
 * prevents dots from overlapping with the axes. The *scale*.round option is
 * useful for crisp edges by rounding to the nearest pixel boundary.
 *
 * In addition to the generic *ordinal* scale type, which requires an explicit
 * output range value for each input domain value, Plot supports special *point*
 * and *band* scale types for encoding ordinal data as position. These scale
 * types accept a [*min*, *max*] range similar to quantitative scales, and
 * divide this continuous interval into discrete points or bands based on the
 * number of distinct values in the domain (*i.e.*, the domain’s cardinality).
 * If the associated marks have no effective width along the ordinal
 * dimension—such as a dot, rule, or tick—then use a *point* scale; otherwise,
 * say for a bar, use a *band* scale. In the image below, the top *x* scale is a
 * *point* scale while the bottom *x* scale is a *band* scale; see [Plot:
 * Scales](https://observablehq.com/@observablehq/plot-scales) for an
 * interactive version.
 *
 * <img src="./img/point-band.png" width="640" height="144" alt="point and band
 * scales">
 *
 * Ordinal position scales support additional options, all specified as
 * proportions in [0, 1]:
 *
 * * *scale*.**padding** - how much of the range to reserve to inset first and
 *   last point or band
 * * *scale*.**align** - where to distribute points or bands (0 = at start, 0.5
 *   = at middle, 1 = at end)
 *
 * For a *band* scale, you can further fine-tune padding:
 *
 * * *scale*.**paddingInner** - how much of the range to reserve to separate
 *   adjacent bands
 * * *scale*.**paddingOuter** - how much of the range to reserve to inset first
 *   and last band
 *
 * Align defaults to 0.5 (centered). Band scale padding defaults to 0.1 (10% of
 * available space reserved for separating bands), while point scale padding
 * defaults to 0.5 (the gap between the first point and the edge is half the
 * distance of the gap between points, and likewise for the gap between the last
 * point and the opposite edge). Note that rounding and mark insets (e.g., for
 * bars and rects) also affect separation between adjacent marks.
 *
 * Plot automatically generates axes for position scales. You can configure
 * these axes with the following options:
 *
 * * *scale*.**axis** - the orientation: *top* or *bottom* for *x*; *left* or
 *   *right* for *y*; null to suppress
 * * *scale*.**ticks** - the approximate number of ticks to generate
 * * *scale*.**tickSize** - the size of each tick (in pixels; default 6)
 * * *scale*.**tickPadding** - the separation between the tick and its label (in
 *   pixels; default 3)
 * * *scale*.**tickFormat** - to format tick values, either a function or format
 *   specifier string; see
 *   [Formats](https://github.com/observablehq/plot/blob/main/README.md#formats)
 * * *scale*.**tickRotate** - whether to rotate tick labels (an angle in degrees
 *   clockwise; default 0)
 * * *scale*.**grid** - if true, draw grid lines across the plot for each tick
 * * *scale*.**line** - if true, draw the axis line
 * * *scale*.**label** - a string to label the axis
 * * *scale*.**labelAnchor** - the label anchor: *top*, *right*, *bottom*,
 *   *left*, or *center*
 * * *scale*.**labelOffset** - the label position offset (in pixels; default 0,
 *   typically for facet axes)
 * * *scale*.**fontVariant** - the font-variant attribute for axis ticks;
 *   defaults to tabular-nums for quantitative axes
 * * *scale*.**ariaLabel** - a short label representing the axis in the
 *   accessibility tree
 * * *scale*.**ariaDescription** - a textual description for the axis
 *
 * Top-level options are also supported as shorthand: **grid** (for *x* and *y*
 * only; see
 * [facet.grid](https://github.com/observablehq/plot/blob/main/README.md#facet-options)),
 * **label**, **axis**, **inset**, **round**, **align**, and **padding**.
 *
 * ### Color options
 *
 * The normal scale types—*linear*, *sqrt*, *pow*, *log*, *symlog*, and
 * *ordinal*—can be used to encode color. In addition, Plot supports special
 * scale types for color:
 *
 * * *categorical* - equivalent to *ordinal*, but defaults to the *tableau10*
 *   scheme
 * * *sequential* - equivalent to *linear*
 * * *cyclical* - equivalent to *linear*, but defaults to the *rainbow* scheme
 * * *threshold* - encodes based on the specified discrete thresholds; defaults
 *   to the *rdylbu* scheme
 * * *quantile* - encodes based on the computed quantile thresholds; defaults to
 *   the *rdylbu* scheme
 * * *quantize* - transforms a continuous domain into quantized thresholds;
 *   defaults to the *rdylbu* scheme
 * * *diverging* - like *linear*, but with a pivot; defaults to the *rdbu*
 *   scheme
 * * *diverging-log* - like *log*, but with a pivot that defaults to 1; defaults
 *   to the *rdbu* scheme
 * * *diverging-pow* - like *pow*, but with a pivot; defaults to the *rdbu*
 *   scheme
 * * *diverging-sqrt* - like *sqrt*, but with a pivot; defaults to the *rdbu*
 *   scheme
 * * *diverging-symlog* - like *symlog*, but with a pivot; defaults to the
 *   *rdbu* scheme
 *
 * For a *threshold* scale, the *domain* represents *n* (typically numeric)
 * thresholds which will produce a *range* of *n* + 1 output colors; the *i*th
 * color of the *range* applies to values that are smaller than the *i*th
 * element of the domain and larger or equal to the *i* - 1th element of the
 * domain. For a *quantile* scale, the *domain* represents all input values to
 * the scale, and the *n* option specifies how many quantiles to compute from
 * the *domain*; *n* quantiles will produce *n* - 1 thresholds, and an output
 * range of *n* colors. For a *quantize* scale, the domain will be transformed
 * into approximately *n* quantized values, where *n* is an option that defaults
 * to 5.
 *
 * By default, all diverging color scales are symmetric around the pivot; set
 * *symmetric* to false if you want to cover the whole extent on both sides.
 *
 * Color scales support two additional options:
 *
 * * *scale*.**scheme** - a named color scheme in lieu of a range, such as
 *   *reds*
 * * *scale*.**interpolate** - in conjunction with a range, how to interpolate
 *   colors
 *
 * For quantile and quantize color scales, the *scale*.scheme option is used in
 * conjunction with *scale*.**n**, which determines how many quantiles or
 * quantized values to compute, and thus the number of elements in the scale’s
 * range; it defaults to 5 (for quintiles in the case of a quantile scale).
 *
 * The following sequential scale schemes are supported for both quantitative
 * and ordinal data:
 *
 * * <sub><img src="./img/blues.png" width="32" height="16" alt="blues"></sub>
 *   *blues*
 * * <sub><img src="./img/greens.png" width="32" height="16" alt="greens"></sub>
 *   *greens*
 * * <sub><img src="./img/greys.png" width="32" height="16" alt="greys"></sub>
 *   *greys*
 * * <sub><img src="./img/oranges.png" width="32" height="16"
 *   alt="oranges"></sub> *oranges*
 * * <sub><img src="./img/purples.png" width="32" height="16"
 *   alt="purples"></sub> *purples*
 * * <sub><img src="./img/reds.png" width="32" height="16" alt="reds"></sub>
 *   *reds*
 * * <sub><img src="./img/bugn.png" width="32" height="16" alt="bugn"></sub>
 *   *bugn*
 * * <sub><img src="./img/bupu.png" width="32" height="16" alt="bupu"></sub>
 *   *bupu*
 * * <sub><img src="./img/gnbu.png" width="32" height="16" alt="gnbu"></sub>
 *   *gnbu*
 * * <sub><img src="./img/orrd.png" width="32" height="16" alt="orrd"></sub>
 *   *orrd*
 * * <sub><img src="./img/pubu.png" width="32" height="16" alt="pubu"></sub>
 *   *pubu*
 * * <sub><img src="./img/pubugn.png" width="32" height="16" alt="pubugn"></sub>
 *   *pubugn*
 * * <sub><img src="./img/purd.png" width="32" height="16" alt="purd"></sub>
 *   *purd*
 * * <sub><img src="./img/rdpu.png" width="32" height="16" alt="rdpu"></sub>
 *   *rdpu*
 * * <sub><img src="./img/ylgn.png" width="32" height="16" alt="ylgn"></sub>
 *   *ylgn*
 * * <sub><img src="./img/ylgnbu.png" width="32" height="16" alt="ylgnbu"></sub>
 *   *ylgnbu*
 * * <sub><img src="./img/ylorbr.png" width="32" height="16" alt="ylorbr"></sub>
 *   *ylorbr*
 * * <sub><img src="./img/ylorrd.png" width="32" height="16" alt="ylorrd"></sub>
 *   *ylorrd*
 * * <sub><img src="./img/cividis.png" width="32" height="16"
 *   alt="cividis"></sub> *cividis*
 * * <sub><img src="./img/inferno.png" width="32" height="16"
 *   alt="inferno"></sub> *inferno*
 * * <sub><img src="./img/magma.png" width="32" height="16" alt="magma"></sub>
 *   *magma*
 * * <sub><img src="./img/plasma.png" width="32" height="16" alt="plasma"></sub>
 *   *plasma*
 * * <sub><img src="./img/viridis.png" width="32" height="16"
 *   alt="viridis"></sub> *viridis*
 * * <sub><img src="./img/cubehelix.png" width="32" height="16"
 *   alt="cubehelix"></sub> *cubehelix*
 * * <sub><img src="./img/turbo.png" width="32" height="16" alt="turbo"></sub>
 *   *turbo*
 * * <sub><img src="./img/warm.png" width="32" height="16" alt="warm"></sub>
 *   *warm*
 * * <sub><img src="./img/cool.png" width="32" height="16" alt="cool"></sub>
 *   *cool*
 *
 * The default color scheme, *turbo*, was chosen primarily to ensure
 * high-contrast visibility. Color schemes such as *blues* make low-value marks
 * difficult to see against a white background, for better or for worse. To use
 * a subset of a continuous color scheme (or any single-argument *interpolate*
 * function), set the *scale*.range property to the corresponding subset of [0,
 * 1]; for example, to use the first half of the *rainbow* color scheme, use a
 * range of [0, 0.5]. By default, the full range [0, 1] is used. If you wish to
 * encode a quantitative value without hue, consider using *opacity* rather than
 * *color* (e.g., use Plot.dot’s *strokeOpacity* instead of *stroke*).
 *
 * The following diverging scale schemes are supported:
 *
 * * <sub><img src="./img/brbg.png" width="32" height="16" alt="brbg"></sub>
 *   *brbg*
 * * <sub><img src="./img/prgn.png" width="32" height="16" alt="prgn"></sub>
 *   *prgn*
 * * <sub><img src="./img/piyg.png" width="32" height="16" alt="piyg"></sub>
 *   *piyg*
 * * <sub><img src="./img/puor.png" width="32" height="16" alt="puor"></sub>
 *   *puor*
 * * <sub><img src="./img/rdbu.png" width="32" height="16" alt="rdbu"></sub>
 *   *rdbu*
 * * <sub><img src="./img/rdgy.png" width="32" height="16" alt="rdgy"></sub>
 *   *rdgy*
 * * <sub><img src="./img/rdylbu.png" width="32" height="16" alt="rdylbu"></sub>
 *   *rdylbu*
 * * <sub><img src="./img/rdylgn.png" width="32" height="16" alt="rdylgn"></sub>
 *   *rdylgn*
 * * <sub><img src="./img/spectral.png" width="32" height="16"
 *   alt="spectral"></sub> *spectral*
 * * <sub><img src="./img/burd.png" width="32" height="16" alt="burd"></sub>
 *   *burd*
 * * <sub><img src="./img/buylrd.png" width="32" height="16" alt="buylrd"></sub>
 *   *buylrd*
 *
 * Picking a diverging color scheme name defaults the scale type to *diverging*;
 * set the scale type to *linear* to treat the color scheme as sequential
 * instead. Diverging color scales support a *scale*.**pivot** option, which
 * defaults to zero. Values below the pivot will use the lower half of the color
 * scheme (*e.g.*, reds for the *rdgy* scheme), while values above the pivot
 * will use the upper half (grays for *rdgy*).
 *
 * The following cylical color schemes are supported:
 *
 * * <sub><img src="./img/rainbow.png" width="32" height="16"
 *   alt="rainbow"></sub> *rainbow*
 * * <sub><img src="./img/sinebow.png" width="32" height="16"
 *   alt="sinebow"></sub> *sinebow*
 *
 * The following categorical color schemes are supported:
 *
 * * <sub><img src="./img/accent.png" width="96" height="16" alt="accent"></sub>
 *   *accent* (8 colors)
 * * <sub><img src="./img/category10.png" width="120" height="16"
 *   alt="category10"></sub> *category10* (10 colors)
 * * <sub><img src="./img/dark2.png" width="96" height="16" alt="dark2"></sub>
 *   *dark2* (8 colors)
 * * <sub><img src="./img/paired.png" width="144" height="16"
 *   alt="paired"></sub> *paired* (12 colors)
 * * <sub><img src="./img/pastel1.png" width="108" height="16"
 *   alt="pastel1"></sub> *pastel1* (9 colors)
 * * <sub><img src="./img/pastel2.png" width="96" height="16"
 *   alt="pastel2"></sub> *pastel2* (8 colors)
 * * <sub><img src="./img/set1.png" width="108" height="16" alt="set1"></sub>
 *   *set1* (9 colors)
 * * <sub><img src="./img/set2.png" width="96" height="16" alt="set2"></sub>
 *   *set2* (8 colors)
 * * <sub><img src="./img/set3.png" width="144" height="16" alt="set3"></sub>
 *   *set3* (12 colors)
 * * <sub><img src="./img/tableau10.png" width="120" height="16"
 *   alt="tableau10"></sub> *tableau10* (10 colors)
 *
 * The following color interpolators are supported:
 *
 * * *rgb* - RGB (red, green, blue)
 * * *hsl* - HSL (hue, saturation, lightness)
 * * *lab* - CIELAB (*a.k.a.* “Lab”)
 * * *hcl* - CIELCh<sub>ab</sub> (*a.k.a.* “LCh” or “HCL”)
 *
 * For example, to use CIELCh<sub>ab</sub>:
 *
 * ```js
 * Plot.plot({
 *   color: {
 *     range: ["red", "blue"],
 *     interpolate: "hcl"
 *   },
 *   marks: …
 * })
 * ```
 *
 * Or to use gamma-corrected RGB (via
 * [d3-interpolate](https://github.com/d3/d3-interpolate)):
 *
 * ```js
 * Plot.plot({
 *   color: {
 *     range: ["red", "blue"],
 *     interpolate: d3.interpolateRgb.gamma(2.2)
 *   },
 *   marks: …
 * })
 * ```
 *
 * ### Sort options
 *
 * If an ordinal scale’s domain is not set, it defaults to natural ascending
 * order; to order the domain by associated values in another dimension, either
 * compute the domain manually (consider
 * [d3.groupSort](https://github.com/d3/d3-array/blob/main/README.md#groupSort))
 * or use an associated mark’s **sort** option. For example, to sort bars by
 * ascending frequency rather than alphabetically by letter:
 *
 * ```js
 * Plot.barY(alphabet, {x: "letter", y: "frequency", sort: {x: "y"}})
 * ```
 *
 * The sort option is an object whose keys are ordinal scale names, such as *x*
 * or *fx*, and whose values are mark channel names, such as *y*, *y1*, or *y2*.
 * By specifying an existing channel rather than a new value, you avoid
 * repeating the order definition and can refer to channels derived by
 * [transforms](https://github.com/observablehq/plot/blob/main/README.md#transforms)
 * (such as
 * [stack](https://github.com/observablehq/plot/blob/main/README.md#stack) or
 * [bin](https://github.com/observablehq/plot/blob/main/README.md#bin)). When
 * sorting on the *x*, if no such channel is defined, the *x2* channel will be
 * used instead if available, and similarly for *y* and *y2*; this is useful for
 * marks that implicitly stack such as
 * [area](https://github.com/observablehq/plot/blob/main/README.md#area),
 * [bar](https://github.com/observablehq/plot/blob/main/README.md#bar), and
 * [rect](https://github.com/observablehq/plot/blob/main/README.md#rect). A sort
 * value may also be specified as *width* or *height*, representing derived
 * channels |*x2* - *x1*| and |*y2* - *y1*| respectively.
 *
 * Note that there may be multiple associated values in the secondary dimension
 * for a given value in the primary ordinal dimension. The secondary values are
 * therefore grouped for each associated primary value, and each group is then
 * aggregated by applying a reducer. Lastly the primary values are sorted based
 * on the associated reduced value in natural ascending order to produce the
 * domain. The default reducer is *max*, but may be changed by specifying the
 * *reduce* option. The above code is shorthand for:
 *
 * ```js
 * Plot.barY(alphabet, {x: "letter", y: "frequency", sort: {x: "y", reduce: "max"}})
 * ```
 *
 * Generally speaking, a reducer only needs to be specified when there are
 * multiple secondary values for a given primary value. TODO An example of
 * assigning categorical colors in a scatterplot by descending count to maximize
 * discriminability. See the [group
 * transform](https://github.com/observablehq/plot/blob/main/README.md#group)
 * for the list of supported reducers.
 *
 * For descending rather than ascending order, use the *reverse* option:
 *
 * ```js
 * Plot.barY(alphabet, {x: "letter", y: "frequency", sort: {x: "y", reverse: true}})
 * ```
 *
 * An additional *limit* option truncates the domain to the first *n* values
 * after sorting. If *limit* is negative, the last *n* values are used instead.
 * Hence, a positive *limit* with *reverse* = true will return the top *n*
 * values in descending order. If *limit* is an array [*lo*, *hi*], the *i*th
 * values with *lo* ≤ *i* < *hi* will be selected. (Note that like the [basic
 * filter
 * transform](https://github.com/observablehq/plot/blob/main/README.md#transforms),
 * limiting the *x* domain here does not affect the computation of the *y*
 * domain, which is computed independently without respect to filtering.)
 *
 * ```js
 * Plot.barY(alphabet, {x: "letter", y: "frequency", sort: {x: "y", limit: 5}})
 * ```
 *
 * If different sort options are needed for different ordinal scales, the
 * channel name can be replaced with a *value* object with additional per-scale
 * options.
 *
 * ```js
 * Plot.barY(alphabet, {x: "letter", y: "frequency", sort: {x: {value: "y", reverse: true}}})
 * ```
 *
 * If the input channel is *data*, then the reducer is passed groups of the
 * mark’s data; this is typically used in conjunction with a custom reducer
 * function, as when the built-in single-channel reducers are insufficient.
 *
 * Note: when the value of the sort option is a string or a function, it is
 * interpreted as a [basic sort
 * transform](https://github.com/observablehq/plot/blob/main/README.md#transforms).
 * To use both sort options and a sort transform, use
 * [Plot.sort](https://github.com/observablehq/plot/blob/main/README.md#plotsortorder-options).
 *
 * ### Facet options
 *
 * The *facet* option enables
 * [faceting](https://observablehq.com/@observablehq/plot-facets). When
 * faceting, two additional band scales may be configured:
 *
 * * **fx** - the horizontal position, a *band* scale
 * * **fy** - the vertical position, a *band* scale
 *
 * Similar to
 * [marks](https://github.com/observablehq/plot/blob/main/README.md#marks),
 * faceting requires specifying data and at least one of two optional channels:
 *
 * * facet.**data** - the data to be faceted
 * * facet.**x** - the horizontal position; bound to the *fx* scale, which must
 *   be *band*
 * * facet.**y** - the vertical position; bound to the *fy* scale, which must be
 *   *band*
 *
 * The facet.**x** and facet.**y** channels are strictly ordinal or categorical
 * (*i.e.*, discrete); each distinct channel value defines a facet. Quantitative
 * data must be manually discretized for faceting, say by rounding or binning.
 * (Automatic binning for quantitative data may be added in the future; see
 * [#14](https://github.com/observablehq/plot/issues/14).)
 *
 * The following *facet* constant options are also supported:
 *
 * * facet.**marginTop** - the top margin
 * * facet.**marginRight** - the right margin
 * * facet.**marginBottom** - the bottom margin
 * * facet.**marginLeft** - the left margin
 * * facet.**margin** - shorthand for the four margins
 * * facet.**grid** - if true, draw grid lines for each facet
 * * facet.**label** - if null, disable default facet axis labels
 *
 * Faceting can be explicitly enabled or disabled on a mark with the *facet*
 * option, which accepts the following values:
 *
 * * *auto* (default) - equivalent to *include* when mark data is strictly equal
 *   to facet data; else null
 * * *include* (or true) - draw the subset of the mark’s data in the current
 *   facet
 * * *exclude* - draw the subset of the mark’s data *not* in the current facet
 * * null (or false) - repeat this mark’s data across all facets (i.e., no
 *   faceting)
 *
 * ```js
 * Plot.plot({
 *   facet: {
 *     data: penguins,
 *     x: "sex"
 *   },
 *   marks: [
 *     Plot.frame(), // draws an outline around each facet
 *     Plot.dot(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm", fill: "#eee", facet: "exclude"}), // draws excluded penguins on each facet
 *     Plot.dot(penguins, {x: "culmen_length_mm", y: "culmen_depth_mm"}) // draws only the current facet’s subset
 *   ]
 * })
 * ```
 *
 * When the *include* or *exclude* facet mode is chosen, the mark data must be
 * parallel to the facet data: the mark data must have the same length and order
 * as the facet data. If the data are not parallel, then the wrong data may be
 * shown in each facet. The default *auto* therefore requires strict equality
 * (`===`) for safety, and using the facet data as mark data is recommended when
 * using the *exclude* facet mode. (To construct parallel data safely, consider
 * using
 * [*array*.map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map)
 * on the facet data.)
 *
 * ## Legends
 *
 * Plot can generate legends for *color*, *opacity*, and *symbol*
 * [scales](https://github.com/observablehq/plot/blob/main/README.md#scale-options).
 * (An opacity scale is treated as a color scale with varying transparency.) For
 * an inline legend, use the *scale*.**legend** option:
 *
 * * *scale*.**legend** - if truthy, generate a legend for the given scale
 *
 * If the *scale*.**legend** option is true, the default legend will be produced
 * for the scale; otherwise, the meaning of the *legend* option depends on the
 * scale. For quantitative color scales, it defaults to *ramp* but may be set to
 * *swatches* for a discrete scale (most commonly for *threshold* color scales);
 * for ordinal color scales and symbol scales, only the *swatches* value is
 * supported.
 *
 * For example, this scatterplot includes a swatches legend for the ordinal
 * color scale:
 *
 * ```js
 * Plot.plot({
 *   color: {
 *     legend: true
 *   },
 *   marks: [
 *     Plot.dot(athletes, {x: "weight", y: "height", stroke: "sex"})
 *   ]
 * })
 * ```
 *
 * Whereas this scatterplot would render a ramp legend for its diverging color
 * scale:
 *
 * ```js
 * Plot.plot({
 *   color: {
 *     type: "diverging",
 *     legend: true
 *   },
 *   marks: [
 *     Plot.dot(gistemp, {x: "Date", y: "Anomaly", stroke: "Anomaly"})
 *   ]
 * })
 * ```
 *
 * #### *plot*.legend(*scaleName*, *options*)
 *
 * Given an existing *plot* returned by
 * [Plot.plot](https://github.com/observablehq/plot/blob/main/README.md#plotplotoptions),
 * returns a detached legend for the *plot*’s scale with the given *scaleName*.
 * The *scaleName* must refer to a scale that supports legends: either
 * `"color"`, `"opacity"`, or `"symbol"`. For example:
 *
 * ```js
 * myplot = Plot.plot(…)
 * ```
 * ```js
 * mylegend = myplot.legend("color")
 * ```
 *
 * Or, with additional *options*:
 *
 * ```js
 * mylegend = myplot.legend("color", {width: 320})
 * ```
 *
 * If there is no scale with the given *scaleName* on the given *plot*, then
 * *plot*.legend will return undefined.
 *
 * Categorical and ordinal color legends are rendered as swatches, unless
 * *options*.**legend** is set to *ramp*. The swatches can be configured with
 * the following options:
 *
 * * *options*.**tickFormat** - a format function for the labels
 * * *options*.**swatchSize** - the size of the swatch (if square)
 * * *options*.**swatchWidth** - the swatches’ width
 * * *options*.**swatchHeight** - the swatches’ height
 * * *options*.**columns** - the number of swatches per row
 * * *options*.**marginLeft** - the legend’s left margin
 * * *options*.**className** - a class name, that defaults to a randomly
 *   generated string scoping the styles
 * * *options*.**width** - the legend’s width (in pixels)
 *
 * Symbol legends are rendered as swatches and support the options above in
 * addition to the following options:
 *
 * * *options*.**fill** - the symbol fill color
 * * *options*.**fillOpacity** - the symbol fill opacity; defaults to 1
 * * *options*.**stroke** - the symbol stroke color
 * * *options*.**strokeOpacity** - the symbol stroke opacity; defaults to 1
 * * *options*.**strokeWidth** - the symbol stroke width; defaults to 1.5
 * * *options*.**r** - the symbol radius; defaults to 4.5 pixels
 *
 * The **fill** and **stroke** symbol legend options can be specified as “color”
 * to apply the color scale when the symbol scale is a redundant encoding. The
 * **fill** defaults to none. The **stroke** defaults to currentColor if the
 * fill is none, and to none otherwise. The **fill** and **stroke** options may
 * also be inherited from the corresponding options on an associated dot mark.
 *
 * Continuous color legends are rendered as a ramp, and can be configured with
 * the following options:
 *
 * * *options*.**label** - the scale’s label
 * * *options*.**ticks** - the desired number of ticks, or an array of tick
 *   values
 * * *options*.**tickFormat** - a format function for the legend’s ticks
 * * *options*.**tickSize** - the tick size
 * * *options*.**round** - if true (default), round tick positions to pixels
 * * *options*.**width** - the legend’s width
 * * *options*.**height** - the legend’s height
 * * *options*.**marginTop** - the legend’s top margin
 * * *options*.**marginRight** - the legend’s right margin
 * * *options*.**marginBottom** - the legend’s bottom margin
 * * *options*.**marginLeft** - the legend’s left margin
 *
 * The **style** legend option allows custom styles to override Plot’s defaults;
 * it has the same behavior as in Plot’s top-level [layout
 * options](https://github.com/observablehq/plot/blob/main/README.md#layout-options).
 */
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
  return (key) => {
    if (!registry.has((key = `${key}`))) throw new Error(`unknown scale: ${key}`);
    return key in scaleDescriptors ? exposeScale(scaleDescriptors[key]) : undefined;
  };
}

function exposeScale({scale, type, domain, range, label, interpolate, interval, transform, percent, pivot}) {
  if (type === "identity") return {type: "identity", apply: (d) => d, invert: (d) => d};
  const unknown = scale.unknown ? scale.unknown() : undefined;
  return {
    type,
    domain: slice(domain), // defensive copy
    ...(range !== undefined && {range: slice(range)}), // defensive copy
    ...(transform !== undefined && {transform}),
    ...(percent && {percent}), // only exposed if truthy
    ...(label !== undefined && {label}),
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
