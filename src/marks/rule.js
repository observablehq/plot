import {create} from "../context.js";
import {identity, number} from "../options.js";
import {Mark} from "../plot.js";
import {isCollapsed} from "../scales.js";
import {applyDirectStyles, applyIndirectStyles, applyTransform, applyChannelStyles, offset} from "../style.js";
import {maybeIntervalX, maybeIntervalY} from "../transforms/interval.js";

const defaults = {
  ariaLabel: "rule",
  fill: null,
  stroke: "currentColor"
};

export class RuleX extends Mark {
  constructor(data, options = {}) {
    const {x, y1, y2, inset = 0, insetTop = inset, insetBottom = inset} = options;
    super(
      data,
      {
        x: {value: x, scale: "x", optional: true},
        y1: {value: y1, scale: "y", optional: true},
        y2: {value: y2, scale: "y", optional: true}
      },
      options,
      defaults
    );
    this.insetTop = number(insetTop);
    this.insetBottom = number(insetBottom);
  }
  render(index, scales, channels, dimensions, context) {
    const {x, y} = scales;
    const {x: X, y1: Y1, y2: Y2} = channels;
    const {width, height, marginTop, marginRight, marginLeft, marginBottom} = dimensions;
    const {insetTop, insetBottom} = this;
    return create("svg:g", context)
      .call(applyIndirectStyles, this, scales, dimensions)
      .call(applyTransform, this, {x: X && x}, offset, 0)
      .call((g) =>
        g
          .selectAll()
          .data(index)
          .enter()
          .append("line")
          .call(applyDirectStyles, this)
          .attr("x1", X ? (i) => X[i] : (marginLeft + width - marginRight) / 2)
          .attr("x2", X ? (i) => X[i] : (marginLeft + width - marginRight) / 2)
          .attr("y1", Y1 && !isCollapsed(y) ? (i) => Y1[i] + insetTop : marginTop + insetTop)
          .attr(
            "y2",
            Y2 && !isCollapsed(y)
              ? y.bandwidth
                ? (i) => Y2[i] + y.bandwidth() - insetBottom
                : (i) => Y2[i] - insetBottom
              : height - marginBottom - insetBottom
          )
          .call(applyChannelStyles, this, channels)
      )
      .node();
  }
}

export class RuleY extends Mark {
  constructor(data, options = {}) {
    const {x1, x2, y, inset = 0, insetRight = inset, insetLeft = inset} = options;
    super(
      data,
      {
        y: {value: y, scale: "y", optional: true},
        x1: {value: x1, scale: "x", optional: true},
        x2: {value: x2, scale: "x", optional: true}
      },
      options,
      defaults
    );
    this.insetRight = number(insetRight);
    this.insetLeft = number(insetLeft);
  }
  render(index, scales, channels, dimensions, context) {
    const {x, y} = scales;
    const {y: Y, x1: X1, x2: X2} = channels;
    const {width, height, marginTop, marginRight, marginLeft, marginBottom} = dimensions;
    const {insetLeft, insetRight} = this;
    return create("svg:g", context)
      .call(applyIndirectStyles, this, scales, dimensions)
      .call(applyTransform, this, {y: Y && y}, 0, offset)
      .call((g) =>
        g
          .selectAll()
          .data(index)
          .enter()
          .append("line")
          .call(applyDirectStyles, this)
          .attr("x1", X1 && !isCollapsed(x) ? (i) => X1[i] + insetLeft : marginLeft + insetLeft)
          .attr(
            "x2",
            X2 && !isCollapsed(x)
              ? x.bandwidth
                ? (i) => X2[i] + x.bandwidth() - insetRight
                : (i) => X2[i] - insetRight
              : width - marginRight - insetRight
          )
          .attr("y1", Y ? (i) => Y[i] : (marginTop + height - marginBottom) / 2)
          .attr("y2", Y ? (i) => Y[i] : (marginTop + height - marginBottom) / 2)
          .call(applyChannelStyles, this, channels)
      )
      .node();
  }
}

/**
 * ```js
 * Plot.ruleX([0]) // as annotation
 * ```
 * ```js
 * Plot.ruleX(alphabet, {x: "letter", y: "frequency"}) // like barY
 * ```
 *
 * Returns a new rule↕︎ with the given *data* and *options*. In addition to the
 * [standard mark
 * options](https://github.com/observablehq/plot/blob/main/README.md#marks), the
 * following channels are optional:
 *
 * * **x** - the horizontal position; bound to the *x* scale
 * * **y1** - the starting vertical position; bound to the *y* scale
 * * **y2** - the ending vertical position; bound to the *y* scale
 *
 * If the **x** option is not specified, it defaults to the identity function
 * and assumes that *data* = [*x₀*, *x₁*, *x₂*, …]. If a **y** option is
 * specified, it is shorthand for the **y2** option with **y1** equal to zero;
 * this is the typical configuration for a vertical lollipop chart with rules
 * aligned at *y* = 0. If the **y1** channel is not specified, the rule will
 * start at the top of the plot (or facet). If the **y2** channel is not
 * specified, the rule will end at the bottom of the plot (or facet).
 *
 * If an **interval** is specified, such as d3.utcDay, **y1** and **y2** can be
 * derived from **y**: *interval*.floor(*y*) is invoked for each *y* to produce
 * *y1*, and *interval*.offset(*y1*) is invoked for each *y1* to produce *y2*.
 * If the interval is specified as a number *n*, *y1* and *y2* are taken as the
 * two consecutive multiples of *n* that bracket *y*.
 */
export function ruleX(data, options) {
  let {x = identity, y, y1, y2, ...rest} = maybeIntervalY(options);
  [y1, y2] = maybeOptionalZero(y, y1, y2);
  return new RuleX(data, {...rest, x, y1, y2});
}

/**
 * ```js
 * Plot.ruleY([0]) // as annotation
 * ```
 *
 * ```js
 * Plot.ruleY(alphabet, {y: "letter", x: "frequency"}) // like barX
 * ```
 *
 * Returns a new rule↔︎ with the given *data* and *options*. In addition to the
 * [standard mark
 * options](https://github.com/observablehq/plot/blob/main/README.md#marks), the
 * following channels are optional:
 *
 * * **y** - the vertical position; bound to the *y* scale
 * * **x1** - the starting horizontal position; bound to the *x* scale
 * * **x2** - the ending horizontal position; bound to the *x* scale
 *
 * If the **y** option is not specified, it defaults to the identity function
 * and assumes that *data* = [*y₀*, *y₁*, *y₂*, …]. If the **x** option is
 * specified, it is shorthand for the **x2** option with **x1** equal to zero;
 * this is the typical configuration for a horizontal lollipop chart with rules
 * aligned at *x* = 0. If the **x1** channel is not specified, the rule will
 * start at the left edge of the plot (or facet). If the **x2** channel is not
 * specified, the rule will end at the right edge of the plot (or facet).
 *
 * If an **interval** is specified, such as d3.utcDay, **x1** and **x2** can be
 * derived from **x**: *interval*.floor(*x*) is invoked for each *x* to produce
 * *x1*, and *interval*.offset(*x1*) is invoked for each *x1* to produce *x2*.
 * If the interval is specified as a number *n*, *x1* and *x2* are taken as the
 * two consecutive multiples of *n* that bracket *x*.
 */
export function ruleY(data, options) {
  let {y = identity, x, x1, x2, ...rest} = maybeIntervalX(options);
  [x1, x2] = maybeOptionalZero(x, x1, x2);
  return new RuleY(data, {...rest, y, x1, x2});
}

// For marks specified either as [0, x] or [x1, x2], or nothing.
function maybeOptionalZero(x, x1, x2) {
  if (x === undefined) {
    if (x1 === undefined) {
      if (x2 !== undefined) return [0, x2];
    } else {
      if (x2 === undefined) return [0, x1];
    }
  } else if (x1 === undefined) {
    return x2 === undefined ? [0, x] : [x, x2];
  } else if (x2 === undefined) {
    return [x, x1];
  }
  return [x1, x2];
}
