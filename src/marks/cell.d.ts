import type {ChannelValueSpec} from "../channel.js";
import type {InsetOptions} from "../inset.js";
import type {Data, MarkOptions, RenderableMark} from "../mark.js";
import type {RectCornerOptions} from "./rect.js";

/** Options for the cell mark. */
export interface CellOptions extends MarkOptions, InsetOptions, RectCornerOptions {
  /**
   * The horizontal position of the cell; an optional ordinal channel typically
   * bound to the *x* scale. If not specified, the cell spans the horizontal
   * extent of the frame; otherwise the *x* scale must be a *band* scale.
   *
   * If *x* represents quantitative or temporal values, use a barX mark instead;
   * if *y* is also quantitative or temporal, use a rect mark.
   */
  x?: ChannelValueSpec;

  /**
   * The vertical position of the cell; an optional ordinal channel typically
   * bound to the *y* scale. If not specified, the cell spans the vertical
   * extent of the frame; otherwise the *y* scale must be a *band* scale.
   *
   * If *y* represents quantitative or temporal values, use a barY mark instead;
   * if *x* is also quantitative or temporal, use a rect mark.
   */
  y?: ChannelValueSpec;
}

/**
 * Returns a rectangular cell mark for the given *data* and *options*. Along
 * with **x** and/or **y**, a **fill** channel is typically specified to encode
 * value as color. For example, for a heatmap of the IMDb ratings of Simpons
 * episodes by season:
 *
 * ```js
 * Plot.cell(simpsons, {x: "number_in_season", y: "season", fill: "imdb_rating"})
 * ```
 *
 * If neither **x** nor **y** are specified, *data* is assumed to be an array of
 * pairs [[*x₀*, *y₀*], [*x₁*, *y₁*], [*x₂*, *y₂*], …] such that **x** = [*x₀*,
 * *x₁*, *x₂*, …] and **y** = [*y₀*, *y₁*, *y₂*, …].
 *
 * Both **x** and **y** should be ordinal; if only **x** is quantitative (or
 * temporal), use a barX mark; if only **y** is quantitative, use a barY mark;
 * if both are quantitative, use a rect mark.
 */
export function cell(data?: Data, options?: CellOptions): Cell;

/**
 * Like cell, but **x** defaults to the zero-based index [0, 1, 2, …], and if
 * **stroke** is not a channel, **fill** defaults to the identity function,
 * assuming that *data* = [*x₀*, *x₁*, *x₂*, …]. For a quick horizontal stripe
 * map visualizating an array of numbers:
 *
 * ```js
 * Plot.cellX(values)
 * ```
 */
export function cellX(data?: Data, options?: CellOptions): Cell;

/**
 * Like cell, but **y** defaults to the zero-based index [0, 1, 2, …], and if
 * **stroke** is not a channel, **fill** defaults to the identity function,
 * assuming that *data* = [*y₀*, *y₁*, *y₂*, …]. For a quick vertical stripe map
 * visualizating an array of numbers:
 *
 * ```js
 * Plot.cellY(values)
 * ```
 */
export function cellY(data?: Data, options?: CellOptions): Cell;

/** The cell mark. */
export class Cell extends RenderableMark {}
