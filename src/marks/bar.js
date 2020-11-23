import {create} from "d3-selection";
import {identity, indexOf} from "../mark.js";
import {defined} from "../defined.js";
import {Mark, string, number} from "../mark.js";

class Bar extends Mark {
  constructor(
    data,
    channels,
    {
      fill = "currentColor",
      fillOpacity,
      stroke,
      strokeWidth,
      strokeOpacity,
      mixBlendMode,
      insetTop = 0,
      insetRight = 0,
      insetBottom = 0,
      insetLeft = 0
    } = {}
  ) {
    super(data, channels);
    this.fill = string(fill);
    this.fillOpacity = number(fillOpacity);
    this.stroke = string(stroke);
    this.strokeWidth = number(strokeWidth);
    this.strokeOpacity = number(strokeOpacity);
    this.mixBlendMode = string(mixBlendMode);
    this.insetTop = number(insetTop);
    this.insetRight = number(insetRight);
    this.insetBottom = number(insetBottom);
    this.insetLeft = number(insetLeft);
  }
  render(I, scales, channels) {
    const {x: X, y: Y} = channels;
    const {
      fill,
      fillOpacity,
      stroke,
      strokeWidth,
      strokeOpacity,
      mixBlendMode
    } = this;
    return create("svg:g")
        .attr("fill", fill)
        .attr("fill-opacity", fillOpacity)
        .attr("stroke", stroke)
        .attr("stroke-width", strokeWidth)
        .attr("stroke-opacity", strokeOpacity)
        .call(g => g.selectAll()
          .data(I.filter(i => defined(X[i]) && defined(Y[i])))
          .join("rect")
            .style("mix-blend-mode", mixBlendMode)
            .attr("x", this._x(scales, channels))
            .attr("width", this._width(scales, channels))
            .attr("y", this._y(scales, channels))
            .attr("height", this._height(scales, channels)))
      .node();
  }
}

export class BarX extends Bar {
  constructor(data, {x = identity, y = indexOf} = {}, style) {
    super(
      data,
      [
        {name: "x", value: x, scale: "x"},
        {name: "y", value: y, scale: "y", type: "band"},
        {value: [0], scale: "x"} // ensure the x-domain includes zero
      ],
      style
    );
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

export class BarY extends Bar {
  constructor(data, {x = indexOf, y = identity} = {}, style) {
    super(
      data,
      [
        {name: "x", value: x, scale: "x", type: "band"},
        {name: "y", value: y, scale: "y"},
        {value: [0], scale: "y"} // ensure the y-domain includes zero
      ],
      style
    );
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

export function barX(data, channels, style) {
  return new BarX(data, channels, style);
}

export function barY(data, channels, style) {
  return new BarY(data, channels, style);
}
