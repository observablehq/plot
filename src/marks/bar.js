import {create} from "../context.js";
import {identity, indexOf, number} from "../options.js";
import {Mark} from "../plot.js";
import {isCollapsed} from "../scales.js";
import {
  applyDirectStyles,
  applyIndirectStyles,
  applyTransform,
  impliedString,
  applyAttr,
  applyChannelStyles
} from "../style.js";
import {maybeIdentityX, maybeIdentityY} from "../transforms/identity.js";
import {maybeIntervalX, maybeIntervalY} from "../transforms/interval.js";
import {maybeStackX, maybeStackY} from "../transforms/stack.js";

export class AbstractBar extends Mark {
  constructor(data, channels, options = {}, defaults) {
    super(data, channels, options, defaults);
    const {inset = 0, insetTop = inset, insetRight = inset, insetBottom = inset, insetLeft = inset, rx, ry} = options;
    this.insetTop = number(insetTop);
    this.insetRight = number(insetRight);
    this.insetBottom = number(insetBottom);
    this.insetLeft = number(insetLeft);
    this.rx = impliedString(rx, "auto"); // number or percentage
    this.ry = impliedString(ry, "auto");
  }
  render(index, scales, channels, dimensions, context) {
    const {rx, ry} = this;
    return create("svg:g", context)
      .call(applyIndirectStyles, this, scales, dimensions)
      .call(this._transform, this, scales)
      .call((g) =>
        g
          .selectAll()
          .data(index)
          .enter()
          .append("rect")
          .call(applyDirectStyles, this)
          .attr("x", this._x(scales, channels, dimensions))
          .attr("width", this._width(scales, channels, dimensions))
          .attr("y", this._y(scales, channels, dimensions))
          .attr("height", this._height(scales, channels, dimensions))
          .call(applyAttr, "rx", rx)
          .call(applyAttr, "ry", ry)
          .call(applyChannelStyles, this, channels)
      )
      .node();
  }
  _x(scales, {x: X}, {marginLeft}) {
    const {insetLeft} = this;
    return X ? (i) => X[i] + insetLeft : marginLeft + insetLeft;
  }
  _y(scales, {y: Y}, {marginTop}) {
    const {insetTop} = this;
    return Y ? (i) => Y[i] + insetTop : marginTop + insetTop;
  }
  _width({x}, {x: X}, {marginRight, marginLeft, width}) {
    const {insetLeft, insetRight} = this;
    const bandwidth = X && x ? x.bandwidth() : width - marginRight - marginLeft;
    return Math.max(0, bandwidth - insetLeft - insetRight);
  }
  _height({y}, {y: Y}, {marginTop, marginBottom, height}) {
    const {insetTop, insetBottom} = this;
    const bandwidth = Y && y ? y.bandwidth() : height - marginTop - marginBottom;
    return Math.max(0, bandwidth - insetTop - insetBottom);
  }
}

const defaults = {
  ariaLabel: "bar"
};

export class BarX extends AbstractBar {
  constructor(data, options = {}) {
    const {x1, x2, y} = options;
    super(
      data,
      {
        x1: {value: x1, scale: "x"},
        x2: {value: x2, scale: "x"},
        y: {value: y, scale: "y", type: "band", optional: true}
      },
      options,
      defaults
    );
  }
  _transform(selection, mark, {x}) {
    selection.call(applyTransform, mark, {x}, 0, 0);
  }
  _x({x}, {x1: X1, x2: X2}, {marginLeft}) {
    const {insetLeft} = this;
    return isCollapsed(x) ? marginLeft + insetLeft : (i) => Math.min(X1[i], X2[i]) + insetLeft;
  }
  _width({x}, {x1: X1, x2: X2}, {marginRight, marginLeft, width}) {
    const {insetLeft, insetRight} = this;
    return isCollapsed(x)
      ? width - marginRight - marginLeft - insetLeft - insetRight
      : (i) => Math.max(0, Math.abs(X2[i] - X1[i]) - insetLeft - insetRight);
  }
}

export class BarY extends AbstractBar {
  constructor(data, options = {}) {
    const {x, y1, y2} = options;
    super(
      data,
      {
        y1: {value: y1, scale: "y"},
        y2: {value: y2, scale: "y"},
        x: {value: x, scale: "x", type: "band", optional: true}
      },
      options,
      defaults
    );
  }
  _transform(selection, mark, {y}) {
    selection.call(applyTransform, mark, {y}, 0, 0);
  }
  _y({y}, {y1: Y1, y2: Y2}, {marginTop}) {
    const {insetTop} = this;
    return isCollapsed(y) ? marginTop + insetTop : (i) => Math.min(Y1[i], Y2[i]) + insetTop;
  }
  _height({y}, {y1: Y1, y2: Y2}, {marginTop, marginBottom, height}) {
    const {insetTop, insetBottom} = this;
    return isCollapsed(y)
      ? height - marginTop - marginBottom - insetTop - insetBottom
      : (i) => Math.max(0, Math.abs(Y2[i] - Y1[i]) - insetTop - insetBottom);
  }
}

/**
 * ```js
 * Plot.barX(alphabet, {y: "letter", x: "frequency"})
 * ```
 *
 * Returns a new horizontal bar↔︎ with the given *data* and *options*. The
 * following channels are required:
 *
 * * **x1** - the starting horizontal position; bound to the *x* scale
 * * **x2** - the ending horizontal position; bound to the *x* scale
 *
 * If neither the **x1** nor **x2** option is specified, the **x** option may be
 * specified as shorthand to apply an implicit [stackX
 * transform](https://github.com/observablehq/plot/blob/main/README.md#plotstackxstack-options);
 * this is the typical configuration for a horizontal bar chart with bars
 * aligned at *x* = 0. If the **x** option is not specified, it defaults to the
 * identity function. If *options* is undefined, then it defaults to **x2** as
 * the identity function and **y** as the index of data; this allows an array of
 * numbers to be passed to Plot.barX to make a quick sequential bar chart.
 *
 * If an **interval** is specified, such as d3.utcDay, **x1** and **x2** can be
 * derived from **x**: *interval*.floor(*x*) is invoked for each *x* to produce
 * *x1*, and *interval*.offset(*x1*) is invoked for each *x1* to produce *x2*.
 * If the interval is specified as a number *n*, *x1* and *x2* are taken as the
 * two consecutive multiples of *n* that bracket *x*.
 *
 * In addition to the [standard bar
 * channels](https://github.com/observablehq/plot/blob/main/README.md#bar), the
 * following optional channels are supported:
 *
 * * **y** - the vertical position; bound to the *y* scale, which must be *band*
 *
 * If the **y** channel is not specified, the bar will span the full vertical
 * extent of the plot (or facet).
 */
export function barX(data, options = {y: indexOf, x2: identity}) {
  return new BarX(data, maybeStackX(maybeIntervalX(maybeIdentityX(options))));
}

/**
 * ```js
 * Plot.barY(alphabet, {x: "letter", y: "frequency"})
 * ```
 *
 * Returns a new vertical bar↕︎ with the given *data* and *options*. The
 * following channels are required:
 *
 * * **y1** - the starting vertical position; bound to the *y* scale
 * * **y2** - the ending vertical position; bound to the *y* scale
 *
 * If neither the **y1** nor **y2** option is specified, the **y** option may be
 * specified as shorthand to apply an implicit [stackY
 * transform](https://github.com/observablehq/plot/blob/main/README.md#plotstackystack-options);
 * this is the typical configuration for a vertical bar chart with bars aligned
 * at *y* = 0. If the **y** option is not specified, it defaults to the identity
 * function. If *options* is undefined, then it defaults to **y2** as the
 * identity function and **x** as the index of data; this allows an array of
 * numbers to be passed to Plot.barY to make a quick sequential bar chart.
 *
 * If an **interval** is specified, such as d3.utcDay, **y1** and **y2** can be
 * derived from **y**: *interval*.floor(*y*) is invoked for each *y* to produce
 * *y1*, and *interval*.offset(*y1*) is invoked for each *y1* to produce *y2*.
 * If the interval is specified as a number *n*, *y1* and *y2* are taken as the
 * two consecutive multiples of *n* that bracket *y*.
 *
 * In addition to the [standard bar
 * channels](https://github.com/observablehq/plot/blob/main/README.md#bar), the
 * following optional channels are supported:
 *
 * * **x** - the horizontal position; bound to the *x* scale, which must be
 *   *band*
 *
 * If the **x** channel is not specified, the bar will span the full horizontal
 * extent of the plot (or facet).
 */
export function barY(data, options = {x: indexOf, y2: identity}) {
  return new BarY(data, maybeStackY(maybeIntervalY(maybeIdentityY(options))));
}
