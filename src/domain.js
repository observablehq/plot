import {extent, sort} from "d3-array";
import {inferType} from "./scale.js";

export function inferDomain(V, {
  invert = false,
  domain,
  rules, // ignored for point and band scales
  type = inferType(domain === undefined ? V : domain)
} = {}) {
  if (domain === undefined) {
    if (type === "point" || type === "band") {
      domain = sort(V);
    } else {
      domain = extent(V);
      if (rules !== undefined) domain = extent([...domain, ...rules]);
    }
  }
  return invert ? Array.from(domain).reverse() : domain;
}

export function inferOrdinalDomain(V, {
  invert = false,
  domain = sort(new Set(V))
} = {}) {
  return invert ? Array.from(domain).reverse() : domain;
}
