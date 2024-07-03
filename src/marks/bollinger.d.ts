import type {CompoundMark, Data, MarkOptions} from "../mark.js";
import type {Map} from "../transforms/map.js";
import type {WindowOptions} from "../transforms/window.js";
import type {AreaXOptions, AreaYOptions} from "./area.js";
import type {LineXOptions, LineYOptions} from "./line.js";

/** Options for the bollinger map method. */
export interface BollingerWindowOptions {
  /** The number of consecutive values in the window; defaults to 20. */
  n?: number;

  /** The number of standard deviations to offset the bands; defaults to 2. */
  k?: number;

  /**
   * How to align the rolling window, placing the current value:
   *
   * - *start* - as the first element in the window
   * - *middle* - in the middle of the window, rounding down if **n** is even
   * - *end* (default) - as the last element in the window
   *
   * Note that *start* and *end* are relative to input order, not natural
   * ascending order by value. For example, if the data is in reverse
   * chronological order, then the meaning of *start* and *end* is effectively
   * reversed because the first data point is the most recent.
   */
  anchor?: WindowOptions["anchor"];

  /**
   * If true (the default), the output start values or end values or both
   * (depending on the **anchor**) of each series may be undefined since there
   * are not enough elements to create a window of size **n**; output values may
   * also be undefined if some of the input values in the corresponding window
   * are undefined.
   *
   * If false, the window will be automatically truncated as needed, and
   * undefined input values are ignored. For example, if **n** is 24 and
   * **anchor** is *middle*, then the initial 11 values have effective window
   * sizes of 13, 14, 15, … 23, and likewise the last 12 values have effective
   * window sizes of 23, 22, 21, … 12. Values computed with a truncated window
   * may be noisy.
   */
  strict?: WindowOptions["strict"];
}

/** Options for the bollinger mark. */
export interface BollingerOptions extends BollingerWindowOptions {
  /**
   * Shorthand for setting both **fill** and **stroke**; affects the stroke of
   * the line and the fill of the area; defaults to *currentColor*.
   */
  color?: MarkOptions["stroke"];
}

/** Options for the bollingerX mark. */
export type BollingerXOptions = BollingerOptions & AreaXOptions & LineXOptions;

/** Options for the bollingerY mark. */
export type BollingerYOptions = BollingerOptions & AreaYOptions & LineYOptions;

/**
 * Returns a new vertically-oriented bollinger mark for the given *data* and
 * *options*, as in a time-series area chart where time goes up↑ (or down↓).
 *
 * If the *x* option is not specified, it defaults to the identity function, as
 * when data is an array of numbers [*x*₀, *x*₁, *x*₂, …]. If the *y* option is
 * not specified, it defaults to [0, 1, 2, …].
 */
export function bollingerX(data?: Data, options?: BollingerXOptions): CompoundMark;

/**
 * Returns a new horizontally-oriented bollinger mark for the given *data* and
 * *options*, as in a time-series area chart where time goes right→ (or ←left).
 *
 * If the *y* option is not specified, it defaults to the identity function, as
 * when data is an array of numbers [*y*₀, *y*₁, *y*₂, …]. If the *x* option is
 * not specified, it defaults to [0, 1, 2, …].
 */
export function bollingerY(data?: Data, options?: BollingerYOptions): CompoundMark;

/**
 * Given the specified bollinger *options*, returns a corresponding map
 * implementation for use with the map transform, allowing the bollinger
 * transform to be applied to arbitrary channels instead of only *x* and *y*.
 * For example, to compute the upper volatility band:
 *
 * ```js
 * Plot.map({y: Plot.bollinger({n: 20, k: 2})}, {x: "Date", y: "Close"})
 * ```
 *
 * Here the *k* option defaults to zero instead of two.
 */
export function bollinger(options?: BollingerWindowOptions): Map;
