import {extent, sort} from "d3-array";
import {inferType} from "./scale.js";

export function inferDomain(V, {
  zero = false,
  invert = false,
  domain,
  type = inferType(domain === undefined ? V : domain)
} = {}) {
  if (type === "point" || type === "band") {
    if (domain === undefined) domain = sort(V);
  } else {
    if (domain === undefined) domain = extent(V);
    if (zero) { // ignored for point scales
      const [min, max] = domain;
      if (min > 0 || max < 0) {
        if (max > 0) domain = [0, max];
        else domain = [min, 0];
      }
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
