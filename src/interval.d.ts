// For internal use.
export type LiteralTimeInterval =
  | "3 months"
  | "10 years"
  | TimeIntervalName
  | (`${TimeIntervalName}s` & Record<never, never>)
  | (`${number} ${TimeIntervalName}` & Record<never, never>)
  | (`${number} ${TimeIntervalName}s` & Record<never, never>);

/**
 * The built-in time intervals; UTC or local time, depending on context. The
 * *week* interval is an alias for *sunday*. The *quarter* interval is every
 * three months, and the *half* interval is every six months, aligned at the
 * start of the year.
 */
export type TimeIntervalName =
  | "second"
  | "minute"
  | "hour"
  | "day"
  | "week"
  | "month"
  | "quarter" // 3 months
  | "half" // 6 months
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
   * that floor(floor(*value*) - *epsilon*) returns the preceding interval
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
   * Returns the value representing the least interval boundary value greater
   * than or equal to the specified *value*. For example, day.ceil(*date*)
   * typically returns 12:00 AM on the date following the given date.
   *
   * This method is idempotent: if the specified date is already ceilinged to
   * the current interval, the same value is returned. Furthermore, the returned
   * value is the maximum expressible value of the associated interval, such
   * that ceil(ceil(*value*) + *epsilon*) returns the following interval
   * boundary value.
   */
  ceil(value: T): T;
}

/** A literal that can be automatically promoted to an interval. */
type LiteralInterval<T> = T extends Date ? LiteralTimeInterval : T extends number ? number : never;

/**
 * How to partition a continuous range into discrete intervals; one of:
 *
 * - an object that implements *floor* and *offset* methods
 * - a named time interval such as *day* (for date intervals)
 * - a number (for number intervals), defining intervals at integer multiples of *n*
 */
export type Interval<T = any> = LiteralInterval<T> | IntervalImplementation<T>;

/**
 * An interval that also supports the *range* method, used to subdivide a
 * continuous range into discrete partitions, say for thresholds or ticks; one
 * of:
 *
 * - an object that implements *floor*, *offset*, and *range* methods
 * - a named time interval such as *day* (for date intervals)
 * - a number (for number intervals), defining intervals at integer multiples of *n*
 */
export type RangeInterval<T = any> = LiteralInterval<T> | RangeIntervalImplementation<T>;

/**
 * A range interval that also supports the *ceil* method, used to nice a scale
 * domain; one of:
 *
 * - an object that implements *floor*, *ceil*, *offset*, and *range* methods
 * - a named time interval such as *day* (for date intervals)
 * - a number (for number intervals), defining intervals at integer multiples of *n*
 */
export type NiceInterval<T = any> = LiteralInterval<T> | NiceIntervalImplementation<T>;
