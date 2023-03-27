import type {ChannelValueSpec} from "../channel.js";
import type {InsetOptions} from "../inset.js";
import type {Data, MarkOptions, RenderableMark} from "../mark.js";

/** Options for the cell mark. */
export interface CellOptions extends MarkOptions, InsetOptions {
  x?: ChannelValueSpec;
  y?: ChannelValueSpec;

  /**
   * The [*x* radius][1] for rounded corners.
   *
   * [1]: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/rx
   */
  rx?: number | string;

  /**
   * The [*y* radius][1] for rounded corners.
   *
   * [1]: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/ry
   */
  ry?: number | string;
}

/**
 * Draws rectangular cells where both *x* and *y* are ordinal, typically in
 * conjunction with a *fill* channel to encode value.
 *
 * For example, given *data* that represents the IMDB rating of Simpsons
 * episodes across seasons, the following returns a heatmap:
 *
 * ```js
 * Plot.cell(simpsons, {x: "number_in_season", y: "season", fill: "imdb_rating"})
 * ```
 *
 * In addition to the standard mark options, including insets and rounded
 * corners, the following optional channels are supported:
 *
 * - **x** - the horizontal position; bound to the *x* scale, which must be
 *   *band*
 * - **y** - the vertical position; bound to the *y* scale, which must be *band*
 *
 * The **stroke** defaults to none. The **fill** defaults to currentColor if the
 * stroke is none, and to none otherwise.
 *
 * If neither the **x** nor **y** options are specified, *data* is assumed to be
 * an array of pairs [[*x₀*, *y₀*], [*x₁*, *y₁*], [*x₂*, *y₂*], …] such that
 * **x** = [*x₀*, *x₁*, *x₂*, …] and **y** = [*y₀*, *y₁*, *y₂*, …].
 *
 * To build a matrix of cells from an array of tuples [[*x₀*, *y₀*, *v₀*],
 * [*x₁*, *y₁*, *v₁*], [*x₂*, *y₂*, *v₂*], …]:
 *
 * ```js
 * Plot.cell(values, {fill: "2"})
 * ```
 */
export function cell(data?: Data, options?: CellOptions): Cell;

/**
 * Like **cell**, with an undefined **y**; the **x** option defaults to [0, 1,
 * 2, …], and if the **fill** option is not specified and **stroke** is not a
 * channel, the fill defaults to the identity function and assumes that *data* =
 * [*x₀*, *x₁*, *x₂*, …]. For a quick horizontal stripe map visualizating an
 * array of numbers:
 *
 * ```js
 * Plot.cellX(values)
 * ```
 */
export function cellX(data?: Data, options?: CellOptions): Cell;

/**
 * Like **cell**, with an undefined **x**; the **y** option defaults to [0, 1,
 * 2, …], and if the **fill** option is not specified and **stroke** is not a
 * channel, the fill defaults to the identity function and assumes that *data* =
 * [*y₀*, *y₁*, *y₂*, …]. For a quick vertical stripe map visualizating an array
 * of numbers:
 *
 * ```js
 * Plot.cellY(values)
 * ```
 */
export function cellY(data?: Data, options?: CellOptions): Cell;

/** The cell mark. */
export class Cell extends RenderableMark {}
