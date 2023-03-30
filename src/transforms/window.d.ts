import type {ReducerFunction, ReducerPercentile} from "../reducer.js";
import type {Transformed} from "./basic.js";
import type {Map} from "./map.js";

/**
 * The built-in window reducer implementations; one of:
 *
 * - *difference* - the difference between the last and first window value
 * - *ratio* - the ratio of the last and first window value
 * - *first* - the first value
 * - *last* - the last value
 * - *deviation* - the standard deviation
 * - *sum* - the sum of values
 * - *min* - the minimum value
 * - *max* - the maximum value
 * - *mean* - the mean (average) value
 * - *median* - the median value
 * - *variance* - the variance per [Welford’s algorithm](https://en.wikipedia.org/wiki/Algorithms_for_calculating_variance#Welford's_online_algorithm)
 * - *mode* - the mode (most common occurrence)
 * - *pXX* - the percentile value, where XX is a number in [00,99]
 */
export type WindowReducerName =
  | "difference" // specific to window
  | "ratio" // specific to window
  | "first"
  | "last"
  | "deviation"
  | "sum"
  | "min"
  | "max"
  | "mean"
  | "median"
  | "variance"
  | "mode"
  | ReducerPercentile;

/**
 * How to reduce aggregated (windowed) values; one of:
 *
 * - a named window reducer implementation such as *mean* or *difference*
 * - a function that takes an array of values and returns the reduced value
 */
export type WindowReducer = WindowReducerName | ReducerFunction;

/** Options for the window transform. */
export interface WindowOptions {
  /**
   * The required size (number of consecutive values) in the window; includes
   * the current value.
   */
  k: number;

  /**
   * How to produce a summary statistic from the **k** values in the current
   * window; one of:
   *
   * - a named window reducer implementation such as *mean* or *difference*
   * - a function that takes an array of values and returns the reduced value
   */
  reduce?: WindowReducer;

  /**
   * How to align the rolling window, placing the current value:
   *
   * - *start* - as the first element in the window
   * - *middle* (default) - in the middle of the window, rounding down if **k** is even
   * - *end* - as the last element in the window
   *
   * Note that *start* and *end* are relative to input order, not natural
   * ascending order by value. For example, if the data is in reverse
   * chronological order, then the meaning of *start* and *end* is effectively
   * reversed because the first data point is the most recent.
   */
  anchor?: "start" | "middle" | "end";

  /** @deprecated See **anchor**. */
  shift?: "leading" | "centered" | "trailing";

  /**
   * If false (the default), the window will be automatically truncated as
   * needed, and undefined input values are ignored. For example, if **k** is 24
   * and **anchor** is *middle*, then the initial 11 values have effective
   * window sizes of 13, 14, 15, … 23, and likewise the last 12 values have
   * effective window sizes of 23, 22, 21, … 12. Values computed with a
   * truncated window may be noisy; if you would prefer to not show this data,
   * set the **strict** option to true.
   *
   * If true, the output start values or end values or both (depending on the
   * **anchor**) of each series may be undefined since there are not enough
   * elements to create a window of size **k**; output values may also be
   * undefined if some of the input values in the corresponding window are
   * undefined.
   */
  strict?: boolean;
}

/**
 * Groups data into series using the first channel of *z*, *fill*, or *stroke*
 * (if any), then derives new *x*, *x1*, and *x2* channels by computing a moving
 * window of channel values and deriving reduced values from the window. For
 * example, to compute a rolling average in *x*:
 *
 * ```js
 * Plot.windowX(24, {x: "Anomaly", y: "Date"});
 * ```
 *
 * If *windowOptions* is a number, it is shorthand for the window size **k**.
 */
export function windowX<T>(windowOptions?: WindowOptions | WindowOptions["k"], options?: T): Transformed<T>;
export function windowX<T>(options?: T & WindowOptions): Transformed<T>;

/**
 * Groups data into series using the first channel of *z*, *fill*, or *stroke*
 * (if any), then derives new *y*, *y1*, and *y2* channels by computing a moving
 * window of channel values and deriving reduced values from the window. For
 * example, to compute a rolling average in *y*:
 *
 * ```js
 * Plot.windowY(24, {x: "Date", y: "Anomaly"});
 * ```
 *
 * If *windowOptions* is a number, it is shorthand for the window size **k**.
 */
export function windowY<T>(windowOptions?: WindowOptions | WindowOptions["k"], options?: T): Transformed<T>;
export function windowY<T>(options?: T & WindowOptions): Transformed<T>;

/**
 * Given the specified window *options*, returns a corresponding map
 * implementation for use with the map transform, allowing the window transform
 * to be applied to arbitrary channels instead of only *x* and *y*. For example,
 * to compute a rolling average for the *title* channel:
 *
 * ```js
 * Plot.map({title: Plot.window(24)}, {x: "Date", title: "Anomaly"})
 * ```
 *
 * If *options* is a number, it is shorthand for the window size **k**.
 */
export function window(options?: WindowOptions | WindowOptions["k"]): Map;
