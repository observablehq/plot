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
    | PXX
    | "deviation"
    | "variance"
    | "x"
    | "x1"
    | "x2"
    | "y"
    | "y1"
    | "y2";

/**
 * Union of strings `"p[00-99]"`.
 */
type PXX = `p${Digit}${Digit}`;

/**
 * Digits 0-9 for deriving `PXX` type.
 */
type Digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
