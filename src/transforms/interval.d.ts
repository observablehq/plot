export function maybeInterval(interval: any): any;
export function maybeTrivialIntervalX(options?: {}): any;
export function maybeTrivialIntervalY(options?: {}): any;
export function maybeIntervalX(options?: {}): any;
export function maybeIntervalY(options?: {}): any;

export type NumberInterval = {
    /**
     * Returns a new number representing the latest interval boundary number before or equal to `v`.
     *
     * @param v A number.
     */
    floor: (v: number) => number,

    /**
     * Returns a new number equal to `v` plus a desired interval.
     *
     * This method is used to derive `x2` from `x1` or `y2` from `y2`.
     *
     * @param v A number.
     */
    offset: (v: number) => number,

    /**
     * Returns a new number representing the earliest interval boundary number after or equal to `v`.
     *
     * @param v A number.
     */
    ceil?: (v: number) => number,

    /**
     * Returns an array of numbers representing every interval boundary after or equal to start (inclusive) and before stop (exclusive).
     *
     * @param start A start number for the range.
     * @param stop A stop number for the range.
     */
    range?: (start: number, stop: number) => number[]
};

// TODO: Generic based on scale?
export type Interval = NumberInterval | TimeInterval;

export type IntervalOptions = {
  interval?: number | Interval
};

import { TimeInterval } from "d3";
