type Digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type ReducerPercentile =
  | (`p${Digit}${Digit}` & Record<never, never>) // see https://github.com/microsoft/TypeScript/issues/29729
  | "p25"
  | "p50"
  | "p75";

export type ReducerName =
  | "first"
  | "last"
  | "count"
  | "distinct"
  | "sum"
  | "proportion"
  | "proportion-facet"
  | "deviation"
  | "min"
  | "min-index"
  | "max"
  | "max-index"
  | "mean"
  | "median"
  | "variance"
  | "mode"
  | ReducerPercentile;

export type ReducerFunction<S = any, T = S> = (values: S[]) => T;

export interface ReducerImplementation<S = any, T = S> {
  reduceIndex(index: number[], values: S[]): T;
  // TODO scope
  // TODO label
}

/** How to reduce aggregated values. */
export type Reducer = ReducerName | ReducerFunction | ReducerImplementation;
