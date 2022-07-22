import type {Primitive} from "d3";
import {ascending, descending} from "d3";

export function defined(x: Primitive | undefined): boolean {
  return x != null && !Number.isNaN(x);
}

export function ascendingDefined(a: Primitive | undefined, b: Primitive | undefined): number {
  return +defined(b) - +defined(a) || ascending(a, b);
}

export function descendingDefined(a: Primitive | undefined, b: Primitive | undefined): number {
  return +defined(b) - +defined(a) || descending(a, b);
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
