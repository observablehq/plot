import {registry, position, radius, opacity} from "./scales/index.js";
import {ScaleDiverging, ScaleLinear, ScalePow, ScaleLog, ScaleSymlog, ScaleIdentity} from "./scales/quantitative.js";
import {ScaleTime, ScaleUtc} from "./scales/temporal.js";
import {ScaleOrdinal, ScalePoint, ScaleBand} from "./scales/ordinal.js";

export function Scales(channels, {inset, round, nice, align, padding, ...options} = {}) {
  const scales = {};
  for (const key of registry.keys()) {
    if (channels.has(key) || options[key]) {
      const scale = Scale(key, channels.get(key), {
        inset: key === "x" || key === "y" ? inset : undefined, // not for facet
        round: registry.get(key) === position ? round : undefined, // only for position
        nice,
        align,
        padding,
        ...options[key]
      });
      if (scale) scales[key] = scale;
    }
  }
  return scales;
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
    const {inset = 0} = scale;
    const {width, marginLeft = 0, marginRight = 0} = dimensions;
    scale.scale.range([marginLeft + inset, width - marginRight - inset]);
  }
  autoScaleRound(scale);
}

function autoScaleRangeY(scale, dimensions) {
  if (scale.range === undefined) {
    const {inset = 0} = scale;
    const {height, marginTop = 0, marginBottom = 0} = dimensions;
    const range = [height - marginBottom - inset, marginTop + inset];
    if (scale.type === "ordinal") range.reverse();
    scale.scale.range(range);
  }
  autoScaleRound(scale);
}

function autoScaleRound(scale) {
  if (scale.round === undefined && scale.type === "ordinal" && scale.scale.step() >= 5) {
    scale.scale.round(true);
  }
}

function Scale(key, channels = [], options = {}) {
  switch (inferScaleType(key, channels, options)) {
    case "diverging": return ScaleDiverging(key, channels, options);
    case "categorical": case "ordinal": return ScaleOrdinal(key, channels, options);
    case "cyclical": case "sequential": case "linear": return ScaleLinear(key, channels, options);
    case "sqrt": return ScalePow(key, channels, {...options, exponent: 0.5});
    case "pow": return ScalePow(key, channels, options);
    case "log": return ScaleLog(key, channels, options);
    case "symlog": return ScaleSymlog(key, channels, options);
    case "utc": return ScaleUtc(key, channels, options);
    case "time": return ScaleTime(key, channels, options);
    case "point": return ScalePoint(key, channels, options);
    case "band": return ScaleBand(key, channels, options);
    case "identity": return registry.get(key) === position ? ScaleIdentity(key, channels, options) : undefined;
    case undefined: return;
    default: throw new Error(`unknown scale type: ${options.type}`);
  }
}

function inferScaleType(key, channels, {type, domain, range}) {
  if (key === "fx" || key === "fy") return "band";
  if (type !== undefined) {
    for (const {type: t} of channels) {
      if (t !== undefined && type !== t) {
        throw new Error(`scale incompatible with channel: ${type} !== ${t}`);
      }
    }
    return type;
  }
  if (registry.get(key) === radius) return "sqrt";
  if (registry.get(key) === opacity) return "linear";
  for (const {type} of channels) if (type !== undefined) return type;
  if ((domain || range || []).length > 2) return asOrdinalType(key);
  if (domain !== undefined) {
    if (isOrdinal(domain)) return asOrdinalType(key);
    if (isTemporal(domain)) return "utc";
    return "linear";
  }
  // If any channel is ordinal or temporal, it takes priority.
  const values = channels.map(({value}) => value).filter(value => value !== undefined);
  if (values.some(isOrdinal)) return asOrdinalType(key);
  if (values.some(isTemporal)) return "utc";
  return "linear";
}

function isOrdinal(values) {
  for (const value of values) {
    if (value == null) continue;
    const type = typeof value;
    return type === "string" || type === "boolean";
  }
}

function isTemporal(values) {
  for (const value of values) {
    if (value == null) continue;
    return value instanceof Date;
  }
}

// Positional scales default to a point scale instead of an ordinal scale.
function asOrdinalType(key) {
  return registry.get(key) === position ? "point" : "ordinal";
}
