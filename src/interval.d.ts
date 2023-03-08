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
export interface CustomInterval<T> {
  floor(value: T): T;
  offset(value: T, offset: number): T;
}

export type TimeInterval = TimeIntervalName | CustomInterval<Date>;

export type NumberInterval = number | CustomInterval<number>;

export type Interval = TimeInterval | NumberInterval;
