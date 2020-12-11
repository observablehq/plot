import {ascending} from "d3-array";
import {create} from "d3-selection";
import {filter} from "../defined.js";
import {Mark, number, indexOf, maybeColor, maybeZero} from "../mark.js";
import {Style, applyDirectStyles, applyIndirectStyles, applyBandTransform} from "../style.js";

export class AbstractBar extends Mark {
  constructor(
    data,
    channels,
    {
      z,
      fill,
      stroke,
      insetTop = 0,
      insetRight = 0,
      insetBottom = 0,
      insetLeft = 0,
      transform,
      ...style
    } = {}
  ) {
    const [vfill, cfill] = maybeColor(fill);
    const [vstroke, cstroke] = maybeColor(stroke);
    super(
      data,
      [
        ...channels,
        {name: "z", value: z, optional: true},
        {name: "fill", value: vfill, scale: "color", optional: true},
        {name: "stroke", value: vstroke, scale: "color", optional: true}
      ],
      transform
    );
    Style(this, {fill: cfill, stroke: cstroke, ...style});
    this.insetTop = number(insetTop);
    this.insetRight = number(insetRight);
    this.insetBottom = number(insetBottom);
    this.insetLeft = number(insetLeft);
  }
  render(I, scales, channels) {
    const {color} = scales;
    const {z: Z, fill: F, stroke: S} = channels;
    const index = filter(I, ...this._positions(channels), F, S);
    if (Z) index.sort((i, j) => ascending(Z[i], Z[j]));
    return create("svg:g")
        .call(applyIndirectStyles, this)
        .call(this._transform, scales)
        .call(g => g.selectAll()
          .data(index)
          .join("rect")
            .call(applyDirectStyles, this)
            .attr("x", this._x(scales, channels))
            .attr("width", this._width(scales, channels))
            .attr("y", this._y(scales, channels))
            .attr("height", this._height(scales, channels))
            .attr("fill", F && (i => color(F[i])))
            .attr("stroke", S && (i => color(S[i]))))
      .node();
  }
}

export class BarX extends AbstractBar {
  constructor(data, {x1, x2, y = indexOf, ...options} = {}) {
    super(
      data,
      [
        {name: "x1", value: x1, scale: "x"},
        {name: "x2", value: x2, scale: "x"},
        {name: "y", value: y, scale: "y", type: "band"}
      ],
      options
    );
  }
  _transform(selection, {x}) {
    selection.call(applyBandTransform, x, false);
  }
  _positions({x1: X1, x2: X2, y: Y}) {
    return [X1, X2, Y];
  }
  _x({x}, {x1: X1, x2: X2}) {
    const {insetLeft} = this;
    return i => Math.min(x(X1[i]), x(X2[i])) + insetLeft;
  }
  _y({y}, {y: Y}) {
    const {insetTop} = this;
    return i => y(Y[i]) + insetTop;
  }
  _width({x}, {x1: X1, x2: X2}) {
    const {insetLeft, insetRight} = this;
    return i => Math.max(0, Math.abs(x(X2[i]) - x(X1[i])) - insetLeft - insetRight);
  }
  _height({y}) {
    const {insetTop, insetBottom} = this;
    return Math.max(0, y.bandwidth() - insetTop - insetBottom);
  }
}

export class BarY extends AbstractBar {
  constructor(data, {x = indexOf, y1, y2, ...options} = {}) {
    super(
      data,
      [
        {name: "x", value: x, scale: "x", type: "band"},
        {name: "y1", value: y1, scale: "y"},
        {name: "y2", value: y2, scale: "y"}
      ],
      options
    );
  }
  _transform(selection, {y}) {
    selection.call(applyBandTransform, false, y);
  }
  _positions({y1: Y1, y2: Y2, x: X}) {
    return [Y1, Y2, X];
  }
  _x({x}, {x: X}) {
    const {insetLeft} = this;
    return i => x(X[i]) + insetLeft;
  }
  _y({y}, {y1: Y1, y2: Y2}) {
    const {insetTop} = this;
    return i => Math.min(y(Y1[i]), y(Y2[i])) + insetTop;
  }
  _width({x}) {
    const {insetLeft, insetRight} = this;
    return Math.max(0, x.bandwidth() - insetLeft - insetRight);
  }
  _height({y}, {y1: Y1, y2: Y2}) {
    const {insetTop, insetBottom} = this;
    return i => Math.max(0, Math.abs(y(Y2[i]) - y(Y1[i])) - insetTop - insetBottom);
  }
}

export function barX(data, {x, x1, x2, ...options} = {}) {
  ([x1, x2] = maybeZero(x, x1, x2));
  return new BarX(data, {...options, x1, x2});
}

export function barY(data, {y, y1, y2, ...options}) {
  ([y1, y2] = maybeZero(y, y1, y2));
  return new BarY(data, {...options, y1, y2});
}
