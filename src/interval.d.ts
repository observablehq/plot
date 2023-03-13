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
  offset(value: T, offset: number): T;
}

export interface RangeIntervalImplementation<T> extends IntervalImplementation<T> {
  range(start: T, stop: T): T[];
}

export type TimeInterval = TimeIntervalName | IntervalImplementation<Date>;

export type TimeRangeInterval = TimeIntervalName | RangeIntervalImplementation<Date>;

export type NumberInterval = number | IntervalImplementation<number>;

export type NumberRangeInterval = number | RangeIntervalImplementation<number>;

export type Interval = TimeInterval | NumberInterval;

export type RangeInterval = TimeRangeInterval | NumberRangeInterval;
