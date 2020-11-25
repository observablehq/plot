import {registry, position, radius} from "./scales/index.js";
import {ScaleDiverging, ScaleLinear, ScalePow, ScaleLog, ScaleSymlog} from "./scales/quantitative.js";
import {ScaleTime, ScaleUtc} from "./scales/temporal.js";
import {ScaleOrdinal, ScalePoint, ScaleBand} from "./scales/ordinal.js";

export function Scales(channels, {inset, round, nice, ...options} = {}) {
  const scales = {};
  for (const key of registry.keys()) {
    if (channels.has(key) || options[key]) {
      scales[key] = Scale(key, channels.get(key), {inset, round, nice, ...options[key]});
    }
  }
  return scales;
}

// Mutates scale.range!
export function autoScaleRange(scales, dimensions) {
  if (scales.x && scales.x.range === undefined) {
    const {inset = 0} = scales.x;
    const {width, marginLeft, marginRight} = dimensions;
    scales.x.scale.range([marginLeft + inset, width - marginRight - inset]);
  }
  if (scales.y && scales.y.range === undefined) {
    const {inset = 0} = scales.y;
    const {height, marginTop, marginBottom} = dimensions;
    const range = [height - marginBottom - inset, marginTop + inset];
    if (scales.y.type === "ordinal") range.reverse();
    scales.y.scale.range(range);
  }
}

function Scale(key, channels = [], options = {}) {
  switch (inferScaleType(key, channels, options)) {
    case "diverging": return ScaleDiverging(key, channels, options);
    case "ordinal": return ScaleOrdinal(key, channels, options);
    case "linear": return ScaleLinear(key, channels, options);
    case "sqrt": return ScalePow(key, channels, {...options, exponent: 0.5});
    case "pow": return ScalePow(key, channels, options);
    case "log": return ScaleLog(key, channels, options);
    case "symlog": return ScaleSymlog(key, channels, options);
    case "utc": return ScaleUtc(key, channels, options);
    case "time": return ScaleTime(key, channels, options);
    case "point": return ScalePoint(key, channels, options);
    case "band": return ScaleBand(key, channels, options);
    case undefined: return;
    default: throw new Error(`unknown scale type: ${options.type}`);
  }
}

function inferScaleType(key, channels, {type, domain}) {
  if (type !== undefined) {
    for (const {type: t} of channels) {
      if (t !== undefined && type !== t) {
        throw new Error(`scale incompatible with channel: ${type} !== ${t}`);
      }
    }
    return type;
  }
  if (registry.get(key) === radius) return "sqrt";
  for (const {type} of channels) {
    if (type !== undefined) return type;
  }
  if (domain !== undefined) {
    if (domain.length > 2) return inferOrdinalType(key);
    type = inferScaleTypeFromValues(key, domain);
    if (type !== undefined) return type;
  }
  channels = channels.filter(({value}) => value !== undefined);
  if (!channels.length) return;
  for (const {value} of channels) {
    type = inferScaleTypeFromValues(key, value);
    if (type !== undefined) return type;
  }
  return "linear";
}

function inferScaleTypeFromValues(key, values) {
  for (const value of values) {
    if (value == null) continue;
    if (typeof value === "string") return inferOrdinalType(key);
    if (typeof value === "boolean") return inferOrdinalType(key);
    if (value instanceof Date) return "utc";
    return "linear";
  }
}

// Positional scales default to a point scale instead of an ordinal scale.
function inferOrdinalType(key) {
  return registry.get(key) === position ? "point" : "ordinal";
}
