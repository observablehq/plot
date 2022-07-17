export type BinOptions<Options> = Options & {
  thresholds?:
    | "auto" // (default) - Scott’s rule, capped at 200
    | "freedman-diaconis"
    | "scott"
    | "sturges"
    // a count (hint) representing the desired number of bins
    | number
    // an array of n threshold values for n + 1 bins
    | unknown[]
    // an interval or time interval (for temporal binning; see below)
    | Required<Interval>
    // a function that returns an array, count, or time interval
    | ((
        values: unknown[],
        domainMin: unknown,
        domainMax: unknown
      ) => unknown[] | number | TimeInterval);
};

export function binX<MarkOptions>(
  outputs?: object,
  options?: BinOptions<MarkOptions>
): MarkOptions;

export function binY<MarkOptions>(
  outputs?: {
    x: string;
  },
  options?: BinOptions<MarkOptions>
): MarkOptions;

export function bin<MarkOptions>(
  outputs?: {
    fill: string;
  },
  options?: BinOptions<MarkOptions>
): MarkOptions;

export function maybeDenseIntervalX(options: any): any;
export function maybeDenseIntervalY(options: any): any;

/**
 * The reduce method is repeatedly passed three arguments: the index for
 * each bin (an array of integers), the input channel’s array of values,
 * and the extent of the bin (an object {x1, x2, y1, y2}); it must then
 * return the corresponding aggregate value for the bin.
 *
 * TODO: Generic binding to input channel?
 *
 * @param index The index for each bin.
 * @param values The input channel’s array of values.
 * @param extent The extent of the bin.
 */
type ReduceMethod<Datum, Output> = (
  index: number[],
  values: Datum[],
  extent: ReduceMethodExtent
) => Output | null | undefined;

/**
 * The reduce method is repeatedly passed three arguments: the index for
 * each bin (an array of integers), the input channel’s array of values,
 * and the extent of the bin (an object {x1, x2, y1, y2}); it must then
 * return the corresponding aggregate value for the bin.
 *
 * If the reducer object’s scope is “data”, then the reduce method is
 * first invoked for the full data; the return value of the reduce
 * method is then made available as a third argument (making the extent
 * the fourth argument).
 *
 * Similarly if the scope is “facet”, then the reduce method is invoked
 * for each facet, and the resulting reduce value is made available
 * while reducing the facet’s bins. (This optional scope is used by the
 * proportion and proportion-facet reducers.)
 *
 * TODO: Generic binding to input channel?
 *
 * @param index In the first invocation this is the `index` of the full
 *  dataset or on the facet, (as specified by the `scope` property of
 *  the parent object).
 *
 *  In subsequent invocations on each bin, this contains the index for
 *  each bin.
 *
 * @param values The input channel’s array of values.
 *
 * @param basis In the first invocation (on the data as specified by the
 *  `scope` property) `basis` is undefined.
 *
 *  In subsequent invocations on each bin, this contains the result from
 *  the first invocation.
 *
 * @param extent In the first invocation (on the data as specified by
 *  the `scope` property of the parent object) `extent` is undefined.
 *
 *  In subsequent invocations on each bin, this contains the extent of
 *  the bin (an object {x1, x2, y1, y2}).
 */
export type ReduceMethodWithScope<Datum, Output, Basis = Output> = (
  index: number[],
  values: Datum[],
  basis?: Basis,
  extent?: ReduceMethodExtent
) => Output | Basis | null | undefined;

export type ReducerObject<Datum, Output, Basis = Output> =
  | {
      reduce: ReduceMethod<Datum, Output>;
    }
  | {
      reduce: ReduceMethodWithScope<Datum, Output, Basis>;
      scope: "data" | "facet";
      /**
       * Optional label for axis.
       */
      label?: string;
    };

/**
 * Type of a `reduce` option value that is used for a transform output.
 *
 * @template Datum The type of a single datum.
 * @template Output The output type for the reducer.
 *
 * For simple cases, this should be the type that is required by the
 * underlying SVG document.
 *
 * When the output channel is bound to a scale, this should be the type
 * that is required by the scale.
 */
export type ReduceOption<Datum, Output> =
  | AggregationMethod
  | ReducerObject<Datum, Output>;

export type ReduceMethodExtent = {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
};

import { TimeInterval } from "d3";
import { AggregationMethod } from ".";
import { Interval } from "./interval";
