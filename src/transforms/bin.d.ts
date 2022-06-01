export type BinOptions<Options> =
    Options
    & {
        thresholds?:
            | "auto" // (default) - Scott’s rule, capped at 200
            | "freedman-diaconis"
            | "scott"
            | "sturges"
            | number // a count (hint) representing the desired number of bins
            | unknown[] // an array of n threshold values for n + 1 bins
            | number // an interval or time interval (for temporal binning; see below)
            // a function that returns an array, count, or time interval
            | (() => unknown[] | number | unknown)
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

import { StandardMarkOptions } from "../plot";
