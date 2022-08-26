import {line as shapeLine} from "d3";
import {create} from "../context.js";
import {Curve} from "../curve.js";
import {indexOf, identity, maybeTuple, maybeZ} from "../options.js";
import {Mark} from "../plot.js";
import {
  applyDirectStyles,
  applyIndirectStyles,
  applyTransform,
  applyGroupedChannelStyles,
  groupIndex
} from "../style.js";
import {maybeDenseIntervalX, maybeDenseIntervalY} from "../transforms/bin.js";
import {applyGroupedMarkers, markers} from "./marker.js";

const defaults = {
  ariaLabel: "line",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  strokeMiterlimit: 1
};

export class Line extends Mark {
  constructor(data, options = {}) {
    const {x, y, z, curve, tension} = options;
    super(
      data,
      {
        x: {value: x, scale: "x"},
        y: {value: y, scale: "y"},
        z: {value: maybeZ(options), optional: true}
      },
      options,
      defaults
    );
    this.z = z;
    this.curve = Curve(curve, tension);
    markers(this, options);
  }
  filter(index) {
    return index;
  }
  render(index, scales, channels, dimensions, context) {
    const {x: X, y: Y} = channels;
    return create("svg:g", context)
      .call(applyIndirectStyles, this, scales, dimensions)
      .call(applyTransform, this, scales)
      .call((g) =>
        g
          .selectAll()
          .data(groupIndex(index, [X, Y], this, channels))
          .enter()
          .append("path")
          .call(applyDirectStyles, this)
          .call(applyGroupedChannelStyles, this, channels)
          .call(applyGroupedMarkers, this, channels)
          .attr(
            "d",
            shapeLine()
              .curve(this.curve)
              .defined((i) => i >= 0)
              .x((i) => X[i])
              .y((i) => Y[i])
          )
      )
      .node();
  }
}

/**
 * ```js
 * Plot.line(aapl, {x: "Date", y: "Close"})
 * ```
 *
 * Returns a new line with the given *data* and *options*. If neither the **x**
 * nor **y** options are specified, *data* is assumed to be an array of pairs
 * [[*x₀*, *y₀*], [*x₁*, *y₁*], [*x₂*, *y₂*], …] such that **x** = [*x₀*, *x₁*,
 * *x₂*, …] and **y** = [*y₀*, *y₁*, *y₂*, …].
 */
export function line(data, options = {}) {
  let {x, y, ...remainingOptions} = options;
  [x, y] = maybeTuple(x, y);
  return new Line(data, {...remainingOptions, x, y});
}

/**
 * ```js
 * Plot.lineX(aapl.map(d => d.Close))
 * ```
 *
 * Similar to
 * [Plot.line](https://github.com/observablehq/plot/blob/main/README.md#plotlinedata-options)
 * except that if the **x** option is not specified, it defaults to the identity
 * function and assumes that *data* = [*x₀*, *x₁*, *x₂*, …]. If the **y** option
 * is not specified, it defaults to [0, 1, 2, …].
 *
 * If the **interval** option is specified, the [binY
 * transform](https://github.com/observablehq/plot/blob/main/README.md#bin) is
 * implicitly applied to the specified *options*. The reducer of the output *x*
 * channel may be specified via the **reduce** option, which defaults to
 * *first*. To default to zero instead of showing gaps in data, as when the
 * observed value represents a quantity, use the *sum* reducer.
 *
 * ```js
 * Plot.lineX(observations, {y: "date", x: "temperature", interval: d3.utcDay})
 * ```
 *
 * The **interval** option is recommended to “regularize” sampled data; for
 * example, if your data represents timestamped temperature measurements and you
 * expect one sample per day, use d3.utcDay as the interval.
 */
export function lineX(data, options = {}) {
  const {x = identity, y = indexOf, ...remainingOptions} = options;
  return new Line(data, maybeDenseIntervalY({...remainingOptions, x, y}));
}

/**
 * ```js
 * Plot.lineY(aapl.map(d => d.Close))
 * ```
 *
 * Similar to
 * [Plot.line](https://github.com/observablehq/plot/blob/main/README.md#plotlinedata-options)
 * except that if the **y** option is not specified, it defaults to the identity
 * function and assumes that *data* = [*y₀*, *y₁*, *y₂*, …]. If the **x** option
 * is not specified, it defaults to [0, 1, 2, …].
 *
 * If the **interval** option is specified, the [binX
 * transform](https://github.com/observablehq/plot/blob/main/README.md#bin) is
 * implicitly applied to the specified *options*. The reducer of the output *y*
 * channel may be specified via the **reduce** option, which defaults to
 * *first*. To default to zero instead of showing gaps in data, as when the
 * observed value represents a quantity, use the *sum* reducer.
 *
 * ```js
 * Plot.lineY(observations, {x: "date", y: "temperature", interval: d3.utcDay})
 * ```
 *
 * The **interval** option is recommended to “regularize” sampled data; for
 * example, if your data represents timestamped temperature measurements and you
 * expect one sample per day, use d3.utcDay as the interval.
 */
export function lineY(data, options = {}) {
  const {x = indexOf, y = identity, ...remainingOptions} = options;
  return new Line(data, maybeDenseIntervalX({...remainingOptions, x, y}));
}
