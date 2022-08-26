import {identity, indexOf, maybeColorChannel, maybeTuple} from "../options.js";
import {applyTransform} from "../style.js";
import {AbstractBar} from "./bar.js";

const defaults = {
  ariaLabel: "cell"
};

export class Cell extends AbstractBar {
  constructor(data, {x, y, ...options} = {}) {
    super(
      data,
      {
        x: {value: x, scale: "x", type: "band", optional: true},
        y: {value: y, scale: "y", type: "band", optional: true}
      },
      options,
      defaults
    );
  }
  _transform(selection, mark) {
    // apply dx, dy
    selection.call(applyTransform, mark, {}, 0, 0);
  }
}

/**
 * ```js
 * Plot.cell(simpsons, {x: "number_in_season", y: "season", fill: "imdb_rating"})
 * ```
 *
 * Returns a new cell with the given *data* and *options*. If neither the **x**
 * nor **y** options are specified, *data* is assumed to be an array of pairs
 * [[*x₀*, *y₀*], [*x₁*, *y₁*], [*x₂*, *y₂*], …] such that **x** = [*x₀*, *x₁*,
 * *x₂*, …] and **y** = [*y₀*, *y₁*, *y₂*, …].
 */
export function cell(data, options = {}) {
  let {x, y, ...remainingOptions} = options;
  [x, y] = maybeTuple(x, y);
  return new Cell(data, {...remainingOptions, x, y});
}

/**
 * ```js
 * Plot.cellX(simpsons.map(d => d.imdb_rating))
 * ```
 *
 * Equivalent to
 * [Plot.cell](https://github.com/observablehq/plot/blob/main/README.md#plotcelldata-options),
 * except that if the **x** option is not specified, it defaults to [0, 1, 2,
 * …], and if the **fill** option is not specified and **stroke** is not a
 * channel, the fill defaults to the identity function and assumes that *data* =
 * [*x₀*, *x₁*, *x₂*, …].
 */
export function cellX(data, options = {}) {
  let {x = indexOf, fill, stroke, ...remainingOptions} = options;
  if (fill === undefined && maybeColorChannel(stroke)[0] === undefined) fill = identity;
  return new Cell(data, {...remainingOptions, x, fill, stroke});
}

/**
 * ```js
 * Plot.cellY(simpsons.map(d => d.imdb_rating))
 * ```
 *
 * Equivalent to
 * [Plot.cell](https://github.com/observablehq/plot/blob/main/README.md#plotcelldata-options),
 * except that if the **y** option is not specified, it defaults to [0, 1, 2,
 * …], and if the **fill** option is not specified and **stroke** is not a
 * channel, the fill defaults to the identity function and assumes that *data* =
 * [*y₀*, *y₁*, *y₂*, …].
 */
export function cellY(data, options = {}) {
  let {y = indexOf, fill, stroke, ...remainingOptions} = options;
  if (fill === undefined && maybeColorChannel(stroke)[0] === undefined) fill = identity;
  return new Cell(data, {...remainingOptions, y, fill, stroke});
}
