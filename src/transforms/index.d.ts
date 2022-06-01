export type AggregationMethod =
    | "first"
    | "last"
    | "count"
    | "distinct"
    | "sum"
    | "proportion"
    | "proportion-facet"
    | "min"
    | "min-index"
    | "max"
    | "max-index"
    | "mean"
    | "median"
    | "mode"
    | "pXX"
    | "deviation"
    | "variance"
    | "x"
    | "x1"
    | "x2"
    | "y"
    | "y1"
    | "y2";

export interface ReducerObject<OutputType, Datum = object> {
    reduce: (d: Datum[]) => OutputType;
}

export type Reducer<OutputType, Datum = object> =
    | AggregationMethod
    | ReducerObject<OutputType, Datum>

