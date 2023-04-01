import type {ChannelValue, ChannelValueDenseBinSpec, ChannelValueSpec} from "../channel.js";
import type {Data, MarkOptions, RenderableMark} from "../mark.js";
import type {BinOptions, BinReducer} from "../transforms/bin.js";

/** Options for the linearRegressionX and linearRegressionY marks. */
interface LinearRegressionOptions extends MarkOptions, BinOptions {
  /** The confidence interval in (0, 1), or 0 to hide bands; defaults to 0.95. */
  ci?: number;
  /** The distance in pixels between samples of the confidence band; defaults to 4. */
  precision?: number;

  /**
   * An optional ordinal channel for grouping data into (possibly stacked)
   * series, producing an independent regression for each group. If not
   * specified, it defaults to **fill** if a channel, or **stroke** if a
   * channel.
   */
  z?: ChannelValue;

  /**
   * How to reduce the dependent variable (**y** for linearRegressionY, or **x**
   * for linearRegressionX) when the independent variable (**x** for
   * linearRegressionY, or **y** for linearRegressionX) is binned with an
   * **interval**; defaults to *first*. For example, for a trend line on the
   * maximum value of the Apple’s stock price by month:
   *
   * ```js
   * Plot.linearRegressionY(aapl, {x: "Date", y: "Close", interval: "month", reduce: "max"})
   * ```
   *
   * To default to zero instead of showing gaps in data, as when the observed
   * value represents a quantity, use the *sum* reducer.
   */
  reduce?: BinReducer;
}

/** Options for the linearRegressionX mark. */
export interface LinearRegressionXOptions extends LinearRegressionOptions {
  /**
   * The independent variable vertical position channel, typically bound to the
   * *y* scale; defaults to the zero-based index of the data [0, 1, 2, …].
   *
   * If an **interval** is specified, **y** values are binned accordingly,
   * allowing zeroes for empty bins instead of interpolating across gaps. This
   * is recommended to “regularize” sampled data; for example, if your data
   * represents timestamped observations and you expect one observation per day,
   * use *day* as the **interval**.
   */
  y?: ChannelValueDenseBinSpec;

  /**
   * The dependent variable horizontal position channel, typically bound to the
   * *x* scale; defaults to identity, assuming that *data* = [*x₀*, *x₁*, *x₂*,
   * …].
   */
  x?: ChannelValueSpec;
}

/** Options for the linearRegressionY mark. */
export interface LinearRegressionYOptions extends LinearRegressionOptions {
  /**
   * The independent variable horizontal position channel, typically bound to
   * the *x* scale; defaults to the zero-based index of the data [0, 1, 2, …].
   *
   * If an **interval** is specified, **x** values are binned accordingly,
   * allowing zeroes for empty bins instead of interpolating across gaps. This
   * is recommended to “regularize” sampled data; for example, if your data
   * represents timestamped observations and you expect one observation per day,
   * use *day* as the **interval**.
   */
  x?: ChannelValueDenseBinSpec;

  /**
   * The dependent variable vertical position channel, typically bound to the
   * *y* scale; defaults to identity, assuming that *data* = [*y₀*, *y₁*, *y₂*,
   * …].
   */
  y?: ChannelValueSpec;
}

/**
 * Like linearRegressionY, but where *x* is the dependent variable and *y* is
 * the independent variable. This orientation is infrequently used, but suitable
 * for example when visualizing a time-series where time goes up↑; use
 * linearRegressionY instead if time goes right→.
 */
export function linearRegressionX(data?: Data, options?: LinearRegressionXOptions): RenderableMark;

/**
 * Returns a mark that draws [linear regression][1] lines with confidence bands,
 * representing the estimated relation of a dependent variable (*y*) on an
 * independent variable (*x*). For example to estimate the linear dependence of
 * horsepower (*hp*) on weight (*wt*):
 *
 * ```js
 * Plot.linearRegressionY(mtcars, {x: "wt", y: "hp"})
 * ```
 *
 * The linear regression line is fit using the [least squares][2] approach. See
 * Torben Jansen’s [“Linear regression with confidence bands”][3] and [this
 * StatExchange question][4] for details on the confidence interval calculation.
 *
 * Multiple regressions can be produced by specifying a **z**, **fill**, or
 * **stroke** channel.
 *
 * [1]: https://en.wikipedia.org/wiki/Linear_regression
 * [2]: https://en.wikipedia.org/wiki/Least_squares
 * [3]: https://observablehq.com/@toja/linear-regression-with-confidence-bands
 * [4]: https://stats.stackexchange.com/questions/101318/understanding-shape-and-calculation-of-confidence-bands-in-linear-regression
 */
export function linearRegressionY(data?: Data, options?: LinearRegressionYOptions): RenderableMark;
