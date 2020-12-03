import {ascending} from "d3-array";

export function defined(x) {
  return x != null && !Number.isNaN(x);
}

export function ascendingDefined(a, b) {
  return defined(a) - defined(b) || ascending(a, b);
}

export function nonempty(x) {
  return x != null && (x + "") !== "";
}

export function filter(index, ...channels) {
  for (const c of channels) {
    if (c) index = index.filter(i => defined(c[i]));
  }
  return index;
}
