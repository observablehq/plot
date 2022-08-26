import {path, symbolCircle} from "d3";
import {create} from "../context.js";
import {positive} from "../defined.js";
import {identity, maybeFrameAnchor, maybeNumberChannel, maybeTuple} from "../options.js";
import {Mark} from "../plot.js";
import {
  applyChannelStyles,
  applyDirectStyles,
  applyFrameAnchor,
  applyIndirectStyles,
  applyTransform
} from "../style.js";
import {maybeSymbolChannel} from "../symbols.js";
import {sort} from "../transforms/basic.js";
import {maybeIntervalMidX, maybeIntervalMidY} from "../transforms/interval.js";

const defaults = {
  ariaLabel: "dot",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5
};

export class Dot extends Mark {
  constructor(data, options = {}) {
    const {x, y, r, rotate, symbol = symbolCircle, frameAnchor} = options;
    const [vrotate, crotate] = maybeNumberChannel(rotate, 0);
    const [vsymbol, csymbol] = maybeSymbolChannel(symbol);
    const [vr, cr] = maybeNumberChannel(r, vsymbol == null ? 3 : 4.5);
    super(
      data,
      {
        x: {value: x, scale: "x", optional: true},
        y: {value: y, scale: "y", optional: true},
        r: {value: vr, scale: "r", filter: positive, optional: true},
        rotate: {value: vrotate, optional: true},
        symbol: {value: vsymbol, scale: "symbol", optional: true}
      },
      options.sort === undefined && options.reverse === undefined
        ? sort({channel: "r", order: "descending"}, options)
        : options,
      defaults
    );
    this.r = cr;
    this.rotate = crotate;
    this.symbol = csymbol;
    this.frameAnchor = maybeFrameAnchor(frameAnchor);

    // Give a hint to the symbol scale; this allows the symbol scale to chose
    // appropriate default symbols based on whether the dots are filled or
    // stroked, and for the symbol legend to match the appearance of the dots.
    const {channels} = this;
    const {symbol: symbolChannel} = channels;
    if (symbolChannel) {
      const {fill: fillChannel, stroke: strokeChannel} = channels;
      symbolChannel.hint = {
        fill: fillChannel ? (fillChannel.value === symbolChannel.value ? "color" : "currentColor") : this.fill,
        stroke: strokeChannel ? (strokeChannel.value === symbolChannel.value ? "color" : "currentColor") : this.stroke
      };
    }
  }
  render(index, scales, channels, dimensions, context) {
    const {x: X, y: Y, r: R, rotate: A, symbol: S} = channels;
    const [cx, cy] = applyFrameAnchor(this, dimensions);
    const circle = this.symbol === symbolCircle;
    return create("svg:g", context)
      .call(applyIndirectStyles, this, scales, dimensions)
      .call(applyTransform, this, scales)
      .call((g) =>
        g
          .selectAll()
          .data(index)
          .enter()
          .append(circle ? "circle" : "path")
          .call(applyDirectStyles, this)
          .call(
            circle
              ? (selection) => {
                  selection
                    .attr("cx", X ? (i) => X[i] : cx)
                    .attr("cy", Y ? (i) => Y[i] : cy)
                    .attr("r", R ? (i) => R[i] : this.r);
                }
              : (selection) => {
                  const translate =
                    X && Y
                      ? (i) => `translate(${X[i]},${Y[i]})`
                      : X
                      ? (i) => `translate(${X[i]},${cy})`
                      : Y
                      ? (i) => `translate(${cx},${Y[i]})`
                      : () => `translate(${cx},${cy})`;
                  selection
                    .attr(
                      "transform",
                      A
                        ? (i) => `${translate(i)} rotate(${A[i]})`
                        : this.rotate
                        ? (i) => `${translate(i)} rotate(${this.rotate})`
                        : translate
                    )
                    .attr("d", (i) => {
                      const p = path(),
                        r = R ? R[i] : this.r;
                      (S ? S[i] : this.symbol).draw(p, r * r * Math.PI);
                      return p;
                    });
                }
          )
          .call(applyChannelStyles, this, channels)
      )
      .node();
  }
}

/**
 * ```js
 * Plot.dot(sales, {x: "units", y: "fruit"})
 * ```
 *
 * Returns a new dot with the given *data* and *options*. If neither the **x**
 * nor **y** nor **frameAnchor** options are specified, *data* is assumed to be
 * an array of pairs [[*x₀*, *y₀*], [*x₁*, *y₁*], [*x₂*, *y₂*], …] such that
 * **x** = [*x₀*, *x₁*, *x₂*, …] and **y** = [*y₀*, *y₁*, *y₂*, …].
 */
export function dot(data, options = {}) {
  let {x, y, ...remainingOptions} = options;
  if (options.frameAnchor === undefined) [x, y] = maybeTuple(x, y);
  return new Dot(data, {...remainingOptions, x, y});
}

/**
 * ```js
 * Plot.dotX(cars.map(d => d["economy (mpg)"]))
 * ```
 *
 * Equivalent to
 * [Plot.dot](https://github.com/observablehq/plot/blob/main/README.md#plotdotdata-options)
 * except that if the **x** option is not specified, it defaults to the identity
 * function and assumes that *data* = [*x₀*, *x₁*, *x₂*, …].
 *
 * If an **interval** is specified, such as d3.utcDay, **y** is transformed to
 * (*interval*.floor(*y*) + *interval*.offset(*interval*.floor(*y*))) / 2. If
 * the interval is specified as a number *n*, *y* will be the midpoint of two
 * consecutive multiples of *n* that bracket *y*.
 */
export function dotX(data, options = {}) {
  const {x = identity, ...remainingOptions} = options;
  return new Dot(data, maybeIntervalMidY({...remainingOptions, x}));
}

/**
 * ```js
 * Plot.dotY(cars.map(d => d["economy (mpg)"]))
 * ```
 *
 * Equivalent to
 * [Plot.dot](https://github.com/observablehq/plot/blob/main/README.md#plotdotdata-options)
 * except that if the **y** option is not specified, it defaults to the identity
 * function and assumes that *data* = [*y₀*, *y₁*, *y₂*, …].
 *
 * If an **interval** is specified, such as d3.utcDay, **x** is transformed to
 * (*interval*.floor(*x*) + *interval*.offset(*interval*.floor(*x*))) / 2. If
 * the interval is specified as a number *n*, *x* will be the midpoint of two
 * consecutive multiples of *n* that bracket *x*.
 */
export function dotY(data, options = {}) {
  const {y = identity, ...remainingOptions} = options;
  return new Dot(data, maybeIntervalMidX({...remainingOptions, y}));
}

/**
 * Equivalent to
 * [Plot.dot](https://github.com/observablehq/plot/blob/main/README.md#plotdotdata-options)
 * except that the **symbol** option is set to *circle*.
 */
export function circle(data, options) {
  return dot(data, {...options, symbol: "circle"});
}

/**
 * Equivalent to
 * [Plot.dot](https://github.com/observablehq/plot/blob/main/README.md#plotdotdata-options)
 * except that the **symbol** option is set to *hexagon*.
 */
export function hexagon(data, options) {
  return dot(data, {...options, symbol: "hexagon"});
}
