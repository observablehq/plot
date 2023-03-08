import {create} from "../context.js";
import {Mark} from "../mark.js";
import {identity, indexOf, number} from "../options.js";
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
      .call(applyIndirectStyles, this, dimensions, context)
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

export function barX(data, options = {y: indexOf, x2: identity}) {
  return new BarX(data, maybeStackX(maybeIntervalX(maybeIdentityX(options))));
}

export function barY(data, options = {x: indexOf, y2: identity}) {
  return new BarY(data, maybeStackY(maybeIntervalY(maybeIdentityY(options))));
}
