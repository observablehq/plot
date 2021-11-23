import {ascending, descending} from "d3";

export function defined(x) {
  return x != null && !Number.isNaN(x);
}

export function ascendingDefined(a, b) {
  return defined(b) - defined(a) || ascending(a, b);
}

export function descendingDefined(a, b) {
  return defined(b) - defined(a) || descending(a, b);
}

export function nonempty(x) {
  return x != null && `${x}` !== "";
}

export function filter(index, ...channels) {
  const ignored = [];
  for (const c of channels) {
    if (c) {
      const test = typeof c === "function" ? c : i => defined(c[i]);
      index = index.filter(i => test(i) || (ignored.push(i), false));
    }
  }
  if (ignored.length > 0) {
    console.warn(`ignored indices:`, ignored);
  }
  return index;
}

export function positive(x) {
  return x > 0 ? x : NaN;
}

export function negative(x) {
  return x < 0 ? x : NaN;
}

export function firstof(...values) {
  for (const v of values) {
    if (v !== undefined) {
      return v;
    }
  }
}
