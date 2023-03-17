/** The built-in time intervals; UTC or local time, depending on context. */
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

/** A custom interval implementation. */
export interface IntervalImplementation<T> {
  /**
   * Returns the value representing the greatest interval boundary less than or
   * equal to the specified *value*. For example, day.floor(*date*) typically
   * returns 12:00 AM on the given date.
   *
   * This method is idempotent: if the specified value is already floored to the
   * current interval, the same value is returned. Furthermore, the returned
   * value is the minimum expressible value of the associated interval, such
   * that floor(floor(*value*) - *epsilon*) returns the preceeding interval
   * boundary value.
   */
  floor(value: T): T;

  /**
   * Returns a new value equal to *value* plus *step* intervals. If *step* is
   * not specified it defaults to 1. If *step* is negative, then the returned
   * value will be less than the specified *value*; if *step* is zero, then the
   * same *value* is returned; if *step* is not an integer, it is floored.
   *
   * This method does not round the specified *value* to the interval. For
   * example, if *date* is today at 5:34 PM, then day.offset(*date*, 1) returns
   * 5:34 PM tomorrow.
   */
  offset(value: T, step?: number): T;
}

/**
 * A custom interval implementation that also supports the range method, say for
 * generating thresholds or ticks.
 */
export interface RangeIntervalImplementation<T> extends IntervalImplementation<T> {
  /**
   * Returns an array of values representing every interval boundary greater
   * than or equal to *start* (inclusive) and less than *stop* (exclusive). The
   * first value in the returned array is the least boundary greater than or
   * equal to *start*; subsequent values are offset by intervals and floored.
   */
  range(start: T, stop: T): T[];
}

/**
 * A custom interval implementation that also supports the range and ceil
 * methods, used for nicing scale domains.
 */
export interface NiceIntervalImplementation<T> extends RangeIntervalImplementation<T> {
  /**
   * Returns a new date representing the earliest interval boundary date after
   * or equal to date. For example, d3.timeDay.ceil(date) typically returns
   * 12:00 AM local time on the date following the given date.
   *
   * This method is idempotent: if the specified date is already ceilinged to
   * the current interval, a new date with an identical time is returned.
   * Furthermore, the returned date is the maximum expressible value of the
   * associated interval, such that interval.ceil(interval.ceil(date) + 1)
   * returns the following interval boundary date.
   */
  ceil(value: T): T;
}

/** A literal that can be automatically promoted to an interval. */
type LiteralInterval<T> = T extends Date ? TimeIntervalName : T extends number ? number : never;

/** How to partition a continuous range into discrete intervals. */
export type Interval<T = any> = LiteralInterval<T> | IntervalImplementation<T>;

/** An interval that supports the range method, say for thresholds or ticks. */
export type RangeInterval<T = any> = LiteralInterval<T> | RangeIntervalImplementation<T>;

/** An interval that can be used to nice a scale domain. */
export type NiceInterval<T = any> = LiteralInterval<T> | NiceIntervalImplementation<T>;
