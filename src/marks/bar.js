import {ascending} from "d3-array";
import {create} from "d3-selection";
import {filter} from "../defined.js";
import {Mark, number, identity, indexOf, maybeColor} from "../mark.js";
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
    const {x: X, y: Y, z: Z, fill: F, stroke: S} = channels;
    const index = filter(I, X, Y, F, S);
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
  constructor(data, {x = identity, y = indexOf, ...options} = {}) {
    super(
      data,
      [
        {name: "x", value: x, scale: "x"},
        {name: "y", value: y, scale: "y", type: "band"},
        {value: [0], scale: "x"} // ensure the x-domain includes zero
      ],
      options
    );
  }
  _transform(selection, {x}) {
    selection.call(applyBandTransform, x, false);
  }
  _x({x}, {x: X}) {
    const {insetLeft} = this;
    return i => Math.min(x(0), x(X[i])) + insetLeft;
  }
  _y({y}, {y: Y}) {
    const {insetTop} = this;
    return i => y(Y[i]) + insetTop;
  }
  _width({x}, {x: X}) {
    const {insetLeft, insetRight} = this;
    return i => Math.max(0, Math.abs(x(X[i]) - x(0)) - insetLeft - insetRight);
  }
  _height({y}) {
    const {insetTop, insetBottom} = this;
    return Math.max(0, y.bandwidth() - insetTop - insetBottom);
  }
}

export class BarY extends AbstractBar {
  constructor(data, {x = indexOf, y = identity, ...options} = {}) {
    super(
      data,
      [
        {name: "x", value: x, scale: "x", type: "band"},
        {name: "y", value: y, scale: "y"},
        {value: [0], scale: "y"} // ensure the y-domain includes zero
      ],
      options
    );
  }
  _transform(selection, {y}) {
    selection.call(applyBandTransform, false, y);
  }
  _x({x}, {x: X}) {
    const {insetLeft} = this;
    return i => x(X[i]) + insetLeft;
  }
  _y({y}, {y: Y}) {
    const {insetTop} = this;
    return i => Math.min(y(0), y(Y[i])) + insetTop;
  }
  _width({x}) {
    const {insetLeft, insetRight} = this;
    return Math.max(0, x.bandwidth() - insetLeft - insetRight);
  }
  _height({y}, {y: Y}) {
    const {insetTop, insetBottom} = this;
    return i => Math.max(0, Math.abs(y(0) - y(Y[i])) - insetTop - insetBottom);
  }
}

export function barX(data, options) {
  return new BarX(data, options);
}

export function barY(data, options) {
  return new BarY(data, options);
}
