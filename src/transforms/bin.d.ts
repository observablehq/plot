export type BinOptions<Options> =
    Options
    & {
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
            | ((values: unknown[], domainMin: unknown, domainMax: unknown) => unknown[] | number | TimeInterval)
    }

export function binX<MarkOptions>(outputs?: object, options?: BinOptions<MarkOptions>): MarkOptions;

export function binY<MarkOptions>(outputs?: {
    x: string;
}, options?: BinOptions<MarkOptions>): MarkOptions;

export function bin<MarkOptions>(outputs?: {
    fill: string;
}, options?: BinOptions<MarkOptions>): MarkOptions;

export function maybeDenseIntervalX(options: any): any;
export function maybeDenseIntervalY(options: any): any;

import { TimeInterval } from "d3";
import { Interval } from "./interval";
