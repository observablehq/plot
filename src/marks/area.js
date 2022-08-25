import {area as shapeArea} from "d3";
import {create} from "../context.js";
import {Curve} from "../curve.js";
import {first, indexOf, maybeZ, second} from "../options.js";
import {Mark} from "../plot.js";
import {
  applyDirectStyles,
  applyIndirectStyles,
  applyTransform,
  applyGroupedChannelStyles,
  groupIndex
} from "../style.js";
import {maybeDenseIntervalX, maybeDenseIntervalY} from "../transforms/bin.js";
import {maybeIdentityX, maybeIdentityY} from "../transforms/identity.js";
import {maybeStackX, maybeStackY} from "../transforms/stack.js";

const defaults = {
  ariaLabel: "area",
  strokeWidth: 1,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  strokeMiterlimit: 1
};

export class Area extends Mark {
  constructor(data, options = {}) {
    const {x1, y1, x2, y2, z, curve, tension} = options;
    super(
      data,
      {
        x1: {value: x1, scale: "x"},
        y1: {value: y1, scale: "y"},
        x2: {value: x2, scale: "x", optional: true},
        y2: {value: y2, scale: "y", optional: true},
        z: {value: maybeZ(options), optional: true}
      },
      options,
      defaults
    );
    this.z = z;
    this.curve = Curve(curve, tension);
  }
  filter(index) {
    return index;
  }
  render(index, scales, channels, dimensions, context) {
    const {x1: X1, y1: Y1, x2: X2 = X1, y2: Y2 = Y1} = channels;
    return create("svg:g", context)
      .call(applyIndirectStyles, this, scales, dimensions)
      .call(applyTransform, this, scales, 0, 0)
      .call((g) =>
        g
          .selectAll()
          .data(groupIndex(index, [X1, Y1, X2, Y2], this, channels))
          .enter()
          .append("path")
          .call(applyDirectStyles, this)
          .call(applyGroupedChannelStyles, this, channels)
          .attr(
            "d",
            shapeArea()
              .curve(this.curve)
              .defined((i) => i >= 0)
              .x0((i) => X1[i])
              .y0((i) => Y1[i])
              .x1((i) => X2[i])
              .y1((i) => Y2[i])
          )
      )
      .node();
  }
}

/**
 * ```js
 * Plot.area(aapl, {x1: "Date", y1: 0, y2: "Close"})
 * ```
 *
 * Returns a new area with the given *data* and *options*. Plot.area is rarely
 * used directly; it is only needed when the baseline and topline have neither
 * common *x* nor *y* values.
 * [Plot.areaY](https://github.com/observablehq/plot/blob/main/README.md#plotareaydata-options)
 * is used in the common horizontal orientation where the baseline and topline
 * share *x* values, while
 * [Plot.areaX](https://github.com/observablehq/plot/blob/main/README.md#plotareaxdata-options)
 * is used in the vertical orientation where the baseline and topline share *y*
 * values.
 */
export function area(data, options) {
  if (options === undefined) return areaY(data, {x: first, y: second});
  return new Area(data, options);
}

/**
 * ```js
 * Plot.areaX(aapl, {y: "Date", x: "Close"})
 * ```
 *
 * Returns a new area with the given *data* and *options*. This constructor is
 * used when the baseline and topline share *y* values, as in a time-series area
 * chart where time goes up↑. If neither the **x1** nor **x2** option is
 * specified, the **x** option may be specified as shorthand to apply an
 * implicit [stackX
 * transform](https://github.com/observablehq/plot/blob/main/README.md#plotstackxstack-options);
 * this is the typical configuration for an area chart with a baseline at *x* =
 * 0. If the **x** option is not specified, it defaults to the identity
 * function. The **y** option specifies the **y1** channel; and the **y1** and
 * **y2** options are ignored.
 *
 * If the **interval** option is specified, the [binY
 * transform](https://github.com/observablehq/plot/blob/main/README.md#bin) is
 * implicitly applied to the specified *options*. The reducer of the output *x*
 * channel may be specified via the **reduce** option, which defaults to
 * *first*. To default to zero instead of showing gaps in data, as when the
 * observed value represents a quantity, use the *sum* reducer.
 *
 * ```js
 * Plot.areaX(observations, {y: "date", x: "temperature", interval: d3.utcDay})
 * ```
 *
 * The **interval** option is recommended to “regularize” sampled data; for
 * example, if your data represents timestamped temperature measurements and you
 * expect one sample per day, use d3.utcDay as the interval.
 */
export function areaX(data, options) {
  const {y = indexOf, ...rest} = maybeDenseIntervalY(options);
  return new Area(data, maybeStackX(maybeIdentityX({...rest, y1: y, y2: undefined})));
}

/**
 * ```js
 * Plot.areaY(aapl, {x: "Date", y: "Close"})
 * ```
 *
 * Returns a new area with the given *data* and *options*. This constructor is
 * used when the baseline and topline share *x* values, as in a time-series area
 * chart where time goes right→. If neither the **y1** nor **y2** option is
 * specified, the **y** option may be specified as shorthand to apply an
 * implicit [stackY
 * transform](https://github.com/observablehq/plot/blob/main/README.md#plotstackystack-options);
 * this is the typical configuration for an area chart with a baseline at *y* =
 * 0. If the **y** option is not specified, it defaults to the identity
 * function. The **x** option specifies the **x1** channel; and the **x1** and
 * **x2** options are ignored.
 *
 * If the **interval** option is specified, the [binX
 * transform](https://github.com/observablehq/plot/blob/main/README.md#bin) is
 * implicitly applied to the specified *options*. The reducer of the output *y*
 * channel may be specified via the **reduce** option, which defaults to
 * *first*. To default to zero instead of showing gaps in data, as when the
 * observed value represents a quantity, use the *sum* reducer.
 *
 * ```js
 * Plot.areaY(observations, {x: "date", y: "temperature", interval: d3.utcDay)
 * ```
 *
 * The **interval** option is recommended to “regularize” sampled data; for
 * example, if your data represents timestamped temperature measurements and you
 * expect one sample per day, use d3.utcDay as the interval.
 */
export function areaY(data, options) {
  const {x = indexOf, ...rest} = maybeDenseIntervalX(options);
  return new Area(data, maybeStackY(maybeIdentityY({...rest, x1: x, x2: undefined})));
}
