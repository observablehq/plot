import {extent, reverse, sort} from "d3-array";

// Given an array of values, and any options, returns the corresponding domain:
// for quantitative data (linear, pow, log, symlog), the domain should be two
// numbers [min, max] or [max, min] (if inverted); for temporal data (time,
// utc), the domain should be two dates [start, end] or [end, start] (if
// inverted); and for ordinal data (point, band), the domain should be an array
// of values. If the domain is specified, a reversed copy is returned if invert
// is true; otherwise the domain is returned as-is. If the domain is not
// specified, it is computed from the given values based on the given type, then
// extended to cover the specified rules, if any. If the type is not specified,
// it is inferred from the given values; see inferType.
export function inferDomain(values, {
  domain,
  invert,
  rules, // ignored for point and band scales
  type // only needed if domain is undefined
} = {}) {
  if (domain === undefined) {
    if (type === undefined) type = inferType(values);
    if (type === "point" || type === "band") {
      domain = sort(new Set(values));
    } else {
      domain = extent(values);
      if (rules !== undefined) domain = extent([...domain, ...rules]);
    }
  }
  return invert ? reverse(domain) : domain;
}

// A special-case of inferDomain where type = "point".
export function inferOrdinalDomain(values, {
  domain = sort(new Set(values)),
  invert
} = {}) {
  return invert ? reverse(domain) : domain;
}

// Given an array of values, infers a suitable scale type. If values contains
// strings, returns point; if values contains Date instances, returns utc;
// otherwise returns linear. Any null or undefined values are ignored. If values
// contains heterogeneous types, the behavior of this function depends on the
// first non-null value.
export function inferType(values) {
  let type = "linear";
  for (const value of values) {
    if (value == null) continue;
    if (typeof value === "string") type = "point";
    else if (value instanceof Date) type = "utc";
    break;
  }
  return type;
}
