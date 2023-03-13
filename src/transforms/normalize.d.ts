import type {ReducerPercentile} from "../reducer.js";
import type {Transformed} from "./basic.js";
import type {Map} from "./map.js";

export type NormalizeBasisName =
  | "deviation"
  | "first"
  | "last"
  | "max"
  | "mean"
  | "median"
  | "min"
  | "sum"
  | "extent"
  | ReducerPercentile;

export type NormalizeBasisFunction = (index: number[], values: any[]) => any;

export type NormalizeBasis = NormalizeBasisName | NormalizeBasisFunction;

export interface NormalizeOptions {
  basis?: NormalizeBasis;
}

export function normalizeX<T>(options?: T & NormalizeOptions): Transformed<T>;

export function normalizeX<T>(basis?: NormalizeBasis, options?: T): Transformed<T>;

export function normalizeY<T>(options?: T & NormalizeOptions): Transformed<T>;

export function normalizeY<T>(basis?: NormalizeBasis, options?: T): Transformed<T>;

export function normalize(basis: NormalizeBasis): Map;
