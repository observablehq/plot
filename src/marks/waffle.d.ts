import type {Data, RenderableMark} from "../mark.js";
import type {BarXOptions, BarYOptions} from "./bar.js";

/** Options for the waffleX and waffleY mark. */
interface WaffleOptions {
  /** The number of cells per row or column; defaults to undefined for automatic. */
  multiple?: number;
  /** The quantity each cell represents; defaults to 1. */
  unit?: number;
  /** The gap in pixels between cells; defaults to 1. */
  gap?: number;
  /** If true, round to integers to avoid partial cells. */
  round?: boolean | ((value: number) => number);
}

/** Options for the waffleX mark. */
export interface WaffleXOptions extends BarXOptions, WaffleOptions {}

/** Options for the waffleY mark. */
export interface WaffleYOptions extends BarYOptions, WaffleOptions {}

/**
 * Returns a new vertical waffle mark for the given *data* and *options*; the
 * required *y* values should be quantitative, and the optional *x* values
 * should be ordinal. For example, for a vertical waffle chart of Olympic
 * athletes by sport:
 *
 * ```js
 * Plot.waffleY(olympians, Plot.groupX({y: "count"}, {x: "sport"}))
 * ```
 *
 * If neither **y1** nor **y2** nor **interval** is specified, an implicit
 * stackY transform is applied and **y** defaults to the identity function,
 * assuming that *data* = [*y₀*, *y₁*, *y₂*, …]. Otherwise if an **interval** is
 * specified, then **y1** and **y2** are derived from **y**, representing the
 * lower and upper bound of the containing interval, respectively. Otherwise, if
 * only one of **y1** or **y2** is specified, the other defaults to **y**, which
 * defaults to zero.
 *
 * The optional **x** ordinal channel specifies the horizontal position; it is
 * typically bound to the *x* scale, which must be a *band* scale. If the **x**
 * channel is not specified, the waffle will span the horizontal extent of the
 * plot’s frame. Because a waffle represents a discrete number of square cells,
 * it may not use all of the available bandwidth.
 *
 * If *options* is undefined, then **x** defaults to the zero-based index of
 * *data* [0, 1, 2, …], allowing a quick waffle chart from an array of numbers:
 *
 * ```js
 * Plot.waffleY([4, 9, 24, 46, 66, 7])
 * ```
 */
export function waffleY(data?: Data, options?: WaffleYOptions): WaffleY;

/**
 * Returns a new horizonta waffle mark for the given *data* and *options*; the
 * required *x* values should be quantitative, and the optional *y* values
 * should be ordinal. For example, for a horizontal waffle chart of Olympic
 * athletes by sport:
 *
 * ```js
 * Plot.waffleX(olympians, Plot.groupY({x: "count"}, {y: "sport"}))
 * ```
 *
 * If neither **x1** nor **x2** nor **interval** is specified, an implicit
 * stackX transform is applied and **x** defaults to the identity function,
 * assuming that *data* = [*x₀*, *x₁*, *x₂*, …]. Otherwise if an **interval** is
 * specified, then **x1** and **x2** are derived from **x**, representing the
 * lower and upper bound of the containing interval, respectively. Otherwise, if
 * only one of **x1** or **x2** is specified, the other defaults to **x**, which
 * defaults to zero.
 *
 * The optional **y** ordinal channel specifies the vertical position; it is
 * typically bound to the *y* scale, which must be a *band* scale. If the **y**
 * channel is not specified, the waffle will span the vertical extent of the
 * plot’s frame. Because a waffle represents a discrete number of square cells,
 * it may not use all of the available bandwidth.
 *
 * If *options* is undefined, then **y** defaults to the zero-based index of
 * *data* [0, 1, 2, …], allowing a quick waffle chart from an array of numbers:
 *
 * ```js
 * Plot.waffleX([4, 9, 24, 46, 66, 7])
 * ```
 */
export function waffleX(data?: Data, options?: WaffleXOptions): WaffleX;

/** The waffleX mark. */
export class WaffleX extends RenderableMark {}

/** The waffleY mark. */
export class WaffleY extends RenderableMark {}
