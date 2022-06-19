export function maybeInterval(interval: any): any;
export function maybeTrivialIntervalX(options?: {}): any;
export function maybeTrivialIntervalY(options?: {}): any;
export function maybeIntervalX(options?: {}): any;
export function maybeIntervalY(options?: {}): any;

// TODO: Generic based on scale?
export type Interval =
TimeInterval
| {
  floor: (v: any) => any,
  offset: (v: any) => any,
}

export type IntervalOptions = {
  interval?: number | Interval
};

import { TimeInterval } from "d3";
