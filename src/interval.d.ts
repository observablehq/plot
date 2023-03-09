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

// TODO Is range required, too?
export interface IntervalImplementation<T> {
  floor(value: T): T;
  offset(value: T, offset: number): T;
}

export type TimeInterval = TimeIntervalName | IntervalImplementation<Date>;

export type NumberInterval = number | IntervalImplementation<number>;

export type Interval = TimeInterval | NumberInterval;
