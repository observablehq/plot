type Digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

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
  | ("p25" | "p50" | "p75" | (`p${Digit}${Digit}` & Record<never, never>)) // percentile
  | "x"
  | "x1"
  | "x2"
  | "y"
  | "y1"
  | "y2";

export type ReducerFunction = (values: any[], extent: {x1: any; y1: any; x2: any; y2: any}) => any; // TODO extent only for bin

export interface ReducerImplementation {
  reduce(index: number[], values: any[], extent: {x1: any; y1: any; x2: any; y2: any}): any; // TODO extent only for bin
}

export type Reducer = ReducerName | ReducerFunction | ReducerImplementation;
