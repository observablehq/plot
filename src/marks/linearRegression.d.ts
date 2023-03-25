import type {ChannelValue, ChannelValueDenseBinSpec, ChannelValueSpec} from "../channel.js";
import type {Data, MarkOptions, RenderableMark} from "../mark.js";
import type {BinOptions, BinReducer} from "../transforms/bin.js";

/** Options for the linearRegressionX and linearRegressionY marks. */
interface LinearRegressionOptions extends MarkOptions, BinOptions {
  /**
   * A channel for the dependent variable **x**.
   */
  x?: ChannelValueSpec;
  /**
   * A channel for the dependent variable **y**.
   */
  y?: ChannelValueSpec;
  /**
   * The series, for multiple regressions.
   */
  z?: ChannelValue;
  /**
   * The confidence interval in [0, 1), or 0 to hide bands; defaults to 0.95.
   */
  ci?: number;
  /**
   * The distance (in pixels) between samples of the confidence band; defaults to 4.
   */
  precision?: number;
  /**
   * 🌶 How is this used?
   */
  reduce?: BinReducer;
}

/** Options for the linearRegressionX mark. */
export interface LinearRegressionXOptions extends LinearRegressionOptions {
  /**
   * A channel for the independent variable **y**.
   */
  y?: ChannelValueDenseBinSpec;
}

/** Options for the linearRegressionY mark. */
export interface LinearRegressionYOptions extends LinearRegressionOptions {
  /**
   * A channel for the independent variable **y**.
   */
  x?: ChannelValueDenseBinSpec;
}

/**
 * Transposed version of **linearRegressionY**, rarely used.
 */
export function linearRegressionX(data?: Data, options?: LinearRegressionXOptions): RenderableMark;

/**
 * Draws [linear regression](https://en.wikipedia.org/wiki/Linear_regression)
 * lines with confidence bands, representing the estimated relation of a
 * dependent variable (*y*) on an independent variable (*x*). The linear
 * regression line is fit using the [least
 * squares](https://en.wikipedia.org/wiki/Least_squares) approach. See Torben
 * Jansen’s [“Linear regression with confidence
 * bands”](https://observablehq.com/@toja/linear-regression-with-confidence-bands)
 * and [this StatExchange
 * question](https://stats.stackexchange.com/questions/101318/understanding-shape-and-calculation-of-confidence-bands-in-linear-regression)
 * for details on the confidence interval calculation.
 *
 * ```js
 * Plot.linearRegressionY(mtcars, {x: "wt", y: "hp"})
 * ```
 *
 * The given *options* are passed through to these underlying marks, with the
 * exception of the following options:
 *
 * - **stroke** - the stroke color of the regression line; defaults to
 *   *currentColor*
 * - **fill** - the fill color of the confidence band; defaults to the line’s
 *   *stroke*
 * - **fillOpacity** - the fill opacity of the confidence band; defaults to 0.1
 * - **ci** - the confidence interval in [0, 1), or 0 to hide bands; defaults to
 *   0.95
 * - **precision** - the distance (in pixels) between samples of the confidence
 *   band; defaults to 4
 *
 * Multiple regressions can be defined by specifying the *z*, *fill*, or
 * *stroke* channel.
 */
export function linearRegressionY(data?: Data, options?: LinearRegressionYOptions): RenderableMark;
