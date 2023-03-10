import type {Transformed} from "./basic.js";
import type {MapImplementation} from "./map.js";

export type NormalizeBasisName =
  | "deviation"
  | "first"
  | "last"
  | "max"
  | "mean"
  | "median"
  | "min"
  | "sum"
  | `p${number}${number}`
  | "extent";

export type NormalizeBasisFunction = (index: number[], values: any[]) => any;

export type NormalizeBasis = NormalizeBasisName | NormalizeBasisFunction;

export function normalizeX<T>(basis: NormalizeBasis, options?: T): Transformed<T>;

export function normalizeY<T>(basis: NormalizeBasis, options?: T): Transformed<T>;

export function normalize(basis: NormalizeBasis): MapImplementation;
