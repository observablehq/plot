import type {Value} from "./data.js";

// TODO: @types/d3 doesn't consider null as a Primitive
type NN = string | number | boolean | Date | undefined;

import {ascending, descending} from "d3";

export function defined(x: Value): boolean {
  return x != null && !Number.isNaN(x);
}

export function ascendingDefined(a: Value, b: Value): number {
  return +defined(b) - +defined(a) || ascending(a as NN, b as NN);
}

export function descendingDefined(a: Value, b: Value): number {
  return +defined(b) - +defined(a) || descending(a as NN, b as NN);
}

export function nonempty(x: unknown): boolean {
  return x != null && `${x}` !== "";
}

export function finite(x: number): number {
  return isFinite(x) ? x : NaN;
}

export function positive(x: number): number {
  return x > 0 && isFinite(x) ? x : NaN;
}

export function negative(x: number): number {
  return x < 0 && isFinite(x) ? x : NaN;
}
