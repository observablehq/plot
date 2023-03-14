export type TimeIntervalName =
  | "second"
  | "minute"
  | "hour"
  | "day"
  | "week"
  | "month"
  | "quarter"
  | "half"
  | "year"
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export interface IntervalImplementation<T> {
  floor(value: T): T;
  offset(value: T, offset?: number): T;
}

export interface RangeIntervalImplementation<T> extends IntervalImplementation<T> {
  range(start: T, stop: T): T[];
}

export interface NiceIntervalImplementation<T> extends RangeIntervalImplementation<T> {
  ceil(value: T): T;
}

type LiteralInterval<T> = T extends Date ? TimeIntervalName : T extends number ? number : never;

export type Interval<T = any> = LiteralInterval<T> | IntervalImplementation<T>;

export type RangeInterval<T = any> = LiteralInterval<T> | RangeIntervalImplementation<T>;

export type NiceInterval<T = any> = LiteralInterval<T> | NiceIntervalImplementation<T>;
