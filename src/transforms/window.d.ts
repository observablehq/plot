import type {ReducerPercentile} from "../reducer.js";
import type {Transformed} from "./basic.js";
import type {Map} from "./map.js";

export type WindowReducerName =
  | "deviation"
  | "max"
  | "mean"
  | "median"
  | "min"
  | "mode"
  | "sum"
  | "variance"
  | "difference"
  | "ratio"
  | "first"
  | "last"
  | ReducerPercentile;

export type WindowReducerFunction = (values: any[]) => any;

export type WindowReducer = WindowReducerName | WindowReducerFunction;

export interface WindowOptions {
  /**
   * The size (number of consecutive values) in the window; includes the current
   * value.
   */
  k: number;

  /**
   * How to produce a summary statistic from the **k** values in the current
   * window. The reducer may be specified as:
   *
   * * *min* - the minimum
   * * *max* - the maximum
   * * *mean* (default) - the mean (average)
   * * *median* - the median
   * * *mode* - the mode (most common occurrence)
   * * *pXX* - the percentile value, where XX is a number in [00,99]
   * * *sum* - the sum of values
   * * *deviation* - the standard deviation
   * * *variance* - the variance per [Welford’s algorithm](https://en.wikipedia.org/wiki/Algorithms_for_calculating_variance#Welford's_online_algorithm)
   * * *difference* - the difference between the last and first window value
   * * *ratio* - the ratio of the last and first window value
   * * *first* - the first value
   * * *last* - the last value
   * * a function to be passed an array of **k** values
   */
  reduce?: WindowReducer;

  /**
   * How to align the rolling window, placing the current value:
   *
   * * *start* - as the first element in the window
   * * *middle* (default) - in the middle of the window, rounding down if **k** is even
   * * *end* - as the last element in the window
   */
  anchor?: "start" | "middle" | "end";

  /** @deprecated See **anchor**. */
  shift?: "leading" | "centered" | "trailing";

  /**
   * If true, the output start values or end values or both (depending on the
   * **anchor**) of each series may be undefined since there are not enough
   * elements to create a window of size **k**; output values may also be
   * undefined if some of the input values in the corresponding window are
   * undefined.
   *
   * If false (the default), the window will be automatically truncated as
   * needed, and undefined input values are ignored. For example, if **k** is 24
   * and **anchor** is *middle*, then the initial 11 values have effective
   * window sizes of 13, 14, 15, … 23, and likewise the last 12 values have
   * effective window sizes of 23, 22, 21, … 12. Values computed with a
   * truncated window may be noisy; if you would prefer to not show this data,
   * set the **strict** option to true.
   */
  strict?: boolean;
}

/**
 * Computes a moving window of *x*, *x1*, and *x2* channel values and then
 * derives a summary statistic from values in the current window, say to compute
 * a rolling average. The window options can be specified as the first argument,
 * or grouped with the *options*. For example, the following are equivalent:
 *
 * ```js
 * Plot.windowX(24, {x: "Anomaly", y: "Date"});
 * Plot.windowX({k: 24, reduce: "mean", x: "Anomaly", y: "Date"});
 * Plot.windowX({k: 24, reduce: "mean"}, {x: "Anomaly", y: "Date"});
 * ```
 */
export function windowX<T>(options?: T & WindowOptions): Transformed<T>;
export function windowX<T>(windowOptions?: WindowOptions | number, options?: T): Transformed<T>;

/**
 * Computes a moving window of *y*, *y1*, and *y2* channel values around and
 * then derives a summary statistic from values in the current window, say to
 * compute a rolling average. The window options can be specified as the first
 * argument, or grouped with the *options*. For example, the following are
 * equivalent:
 *
 * ```js
 * Plot.windowY(24, {x: "Date", y: "Anomaly"});
 * Plot.windowY({k: 24, reduce: "mean", x: "Date", y: "Anomaly"});
 * Plot.windowY({k: 24, reduce: "mean"}, {x: "Date", y: "Anomaly"});
 * ```
 */
export function windowY<T>(options?: T & WindowOptions): Transformed<T>;
export function windowY<T>(windowOptions?: WindowOptions | number, options?: T): Transformed<T>;

/**
 * Returns a window map method suitable for use with Plot.map. The options are
 * the window size *k*, or an object with properties *k*, *anchor*, *reduce*, or
 * *strict*.
 *
 * ```js
 * Plot.map({y: Plot.window(24)}, {x: "Date", y: "Close", stroke: "Symbol"})
 * ```
 */
export function window(options?: WindowOptions | number): Map;
