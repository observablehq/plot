import {ascending, descending} from "d3";

export function defined(x) {
  return x != null && !Number.isNaN(x);
}

export function ascendingDefined(a, b) {
  return +defined(b) - +defined(a) || ascending(a, b);
}

export function descendingDefined(a, b) {
  return +defined(b) - +defined(a) || descending(a, b);
}

export function nonempty(x) {
  return x != null && `${x}` !== "";
}

export function finite(x) {
  return isFinite(x) ? x : NaN;
}

export function positive(x) {
  return x > 0 && isFinite(x) ? x : NaN;
}

export function negative(x) {
  return x < 0 && isFinite(x) ? x : NaN;
}
