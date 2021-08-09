import {create} from "d3";
import {filter} from "../defined.js";
import {Mark, number} from "../mark.js";
import {applyDirectStyles, applyIndirectStyles, applyTransform, impliedString, applyAttr, applyChannelStyles} from "../style.js";
import {maybeStackX, maybeStackY} from "../transforms/stack.js";

const defaults = {};

export class AbstractBar extends Mark {
  constructor(data, channels, options = {}) {
    super(data, channels, options, defaults);
    const {inset = 0, insetTop = inset, insetRight = inset, insetBottom = inset, insetLeft = inset, rx, ry} = options;
    this.insetTop = number(insetTop);
    this.insetRight = number(insetRight);
    this.insetBottom = number(insetBottom);
    this.insetLeft = number(insetLeft);
    this.rx = impliedString(rx, "auto"); // number or percentage
    this.ry = impliedString(ry, "auto");
  }
  render(I, scales, channels, dimensions) {
    const {rx, ry} = this;
    const index = filter(I, ...this._positions(channels));
    return create("svg:g")
        .call(applyIndirectStyles, this)
        .call(this._transform, scales)
        .call(g => g.selectAll()
          .data(index)
          .join("rect")
            .call(applyDirectStyles, this)
            .attr("x", this._x(scales, channels, dimensions))
            .attr("width", this._width(scales, channels, dimensions))
            .attr("y", this._y(scales, channels, dimensions))
            .attr("height", this._height(scales, channels, dimensions))
            .call(applyAttr, "rx", rx)
            .call(applyAttr, "ry", ry)
            .call(applyChannelStyles, channels))
      .node();
  }
  _x(scales, {x: X}, {marginLeft}) {
    const {insetLeft} = this;
    return X ? i => X[i] + insetLeft : marginLeft + insetLeft;
  }
  _y(scales, {y: Y}, {marginTop}) {
    const {insetTop} = this;
    return Y ? i => Y[i] + insetTop : marginTop + insetTop;
  }
  _width({x}, {x: X}, {marginRight, marginLeft, width}) {
    const {insetLeft, insetRight} = this;
    const bandwidth = X ? x.bandwidth() : width - marginRight - marginLeft;
    return Math.max(0, bandwidth - insetLeft - insetRight);
  }
  _height({y}, {y: Y}, {marginTop, marginBottom, height}) {
    const {insetTop, insetBottom} = this;
    const bandwidth = Y ? y.bandwidth() : height - marginTop - marginBottom;
    return Math.max(0, bandwidth - insetTop - insetBottom);
  }
}

export class BarX extends AbstractBar {
  constructor(data, options = {}) {
    const {x1, x2, y} = options;
    super(
      data,
      [
        {name: "x1", value: x1, scale: "x"},
        {name: "x2", value: x2, scale: "x"},
        {name: "y", value: y, scale: "y", type: "band", optional: true}
      ],
      options
    );
  }
  _transform(selection, {x}) {
    selection.call(applyTransform, x, null);
  }
  _positions({x1: X1, x2: X2, y: Y}) {
    return [X1, X2, Y];
  }
  _x(scales, {x1: X1, x2: X2}) {
    const {insetLeft} = this;
    return i => Math.min(X1[i], X2[i]) + insetLeft;
  }
  _width(scales, {x1: X1, x2: X2}) {
    const {insetLeft, insetRight} = this;
    return i => Math.max(0, Math.abs(X2[i] - X1[i]) - insetLeft - insetRight);
  }
}

export class BarY extends AbstractBar {
  constructor(data, options = {}) {
    const {x, y1, y2} = options;
    super(
      data,
      [
        {name: "y1", value: y1, scale: "y"},
        {name: "y2", value: y2, scale: "y"},
        {name: "x", value: x, scale: "x", type: "band", optional: true}
      ],
      options
    );
  }
  _transform(selection, {y}) {
    selection.call(applyTransform, null, y);
  }
  _positions({y1: Y1, y2: Y2, x: X}) {
    return [Y1, Y2, X];
  }
  _y(scales, {y1: Y1, y2: Y2}) {
    const {insetTop} = this;
    return i => Math.min(Y1[i], Y2[i]) + insetTop;
  }
  _height(scales, {y1: Y1, y2: Y2}) {
    const {insetTop, insetBottom} = this;
    return i => Math.max(0, Math.abs(Y2[i] - Y1[i]) - insetTop - insetBottom);
  }
}

export function barX(data, options) {
  return new BarX(data, maybeStackX(options));
}

export function barY(data, options) {
  return new BarY(data, maybeStackY(options));
}
