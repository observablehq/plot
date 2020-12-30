import {ascending} from "d3-array";
import {create} from "d3-selection";
import {filter, nonempty} from "../defined.js";
import {Mark, number, maybeColor, maybeZero, indexOf, title} from "../mark.js";
import {Style, applyDirectStyles, applyIndirectStyles, applyTransform} from "../style.js";

export class AbstractBar extends Mark {
  constructor(
    data,
    channels,
    {
      z,
      title,
      fill,
      stroke,
      label,
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
        {name: "title", value: title, optional: true},
        {name: "label", value: label, optional: true},
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
  render(I, scales, channels, options) {
    const {color} = scales;
    const {z: Z, title: T, label: L, fill: F, stroke: S} = channels;
    const index = filter(I, ...this._positions(channels), F, S);
    if (Z) index.sort((i, j) => ascending(Z[i], Z[j]));
    const x = this._x(scales, channels, options);
    const width = this._width(scales, channels, options);
    const y = this._y(scales, channels, options);
    const height = this._height(scales, channels, options);

    return create("svg:g")
        .call(applyIndirectStyles, this)
        .call(this._transform, scales)
        .call(g => g.selectAll()
          .data(index)
          .join("rect")
            .call(applyDirectStyles, this)
            .attr("x", x)
            .attr("width", width)
            .attr("y", y)
            .attr("height", height)
            .attr("fill", F && (i => color(F[i])))
            .attr("stroke", S && (i => color(S[i])))
            .call(title(T)))
        .call(this._label(L, index, {x, y, width, height}))
      .node();
  }
  _x({x}, {x: X}, {marginLeft}) {
    const {insetLeft} = this;
    return X ? i => x(X[i]) + insetLeft : marginLeft + insetLeft;
  }
  _y({y}, {y: Y}, {marginTop}) {
    const {insetTop} = this;
    return Y ? i => y(Y[i]) + insetTop : marginTop + insetTop;
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
  _label() { return () => {}; }
}

export class BarX extends AbstractBar {
  constructor(data, {x1, x2, y, ...options} = {}) {
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
    selection.call(applyTransform, x, false);
  }
  _positions({x1: X1, x2: X2, y: Y}) {
    return [X1, X2, Y];
  }
  _x({x}, {x1: X1, x2: X2}) {
    const {insetLeft} = this;
    return i => Math.min(x(X1[i]), x(X2[i])) + insetLeft;
  }
  _width({x}, {x1: X1, x2: X2}) {
    const {insetLeft, insetRight} = this;
    return i => Math.max(0, Math.abs(x(X2[i]) - x(X1[i])) - insetLeft - insetRight);
  }
  _label(L, index, {x, y, width, height}) {
    const h = (typeof height === "function") ? height : () => height;
    const w = (typeof width === "function") ? width : () => width;
  
    return L ? g => {
      g.selectAll("text")
      .data(index.filter(i => nonempty(L[i])))
      .join("text")
        .text(i => L[i])
        .attr("x", i => x(i) + w(i))
        .attr("dx", i => w(i) < 20 ? 4 : -4)
        .attr("text-anchor", i => w(i) < 20 ? "start" : "end")
        .attr("y", i => y(i) + h(i) / 2)
        .attr("dominant-baseline", "central")
        .style("fill", i => w(i) < 20 ? "black" : "white");
      } : () => {};
  }
}

export class BarY extends AbstractBar {
  constructor(data, {x, y1, y2, ...options} = {}) {
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
    selection.call(applyTransform, false, y);
  }
  _positions({y1: Y1, y2: Y2, x: X}) {
    return [Y1, Y2, X];
  }
  _y({y}, {y1: Y1, y2: Y2}) {
    const {insetTop} = this;
    return i => Math.min(y(Y1[i]), y(Y2[i])) + insetTop;
  }
  _height({y}, {y1: Y1, y2: Y2}) {
    const {insetTop, insetBottom} = this;
    return i => Math.max(0, Math.abs(y(Y2[i]) - y(Y1[i])) - insetTop - insetBottom);
  }
  _label(L, index, {x, y, width, height}) {
    const h = (typeof height === "function") ? height : () => height;
    const w = (typeof width === "function") ? width : () => width;
  
    return L ? g => {
      g.selectAll("text")
      .data(index.filter(i => nonempty(L[i])))
      .join("text")
        .text(i => L[i])
        .attr("x", i => x(i) + w(i) / 2)
        .attr("text-anchor", "center")
        .attr("y", i => y(i))
        .attr("dy", i => h(i) < 20 ? -4 : 12)
        .style("fill", i => h(i) < 20 ? "black" : "white");
      } : () => {};
  }
}

export function barX(data, {x, x1, x2, y = indexOf, ...options} = {}) {
  ([x1, x2] = maybeZero(x, x1, x2));
  return new BarX(data, {...options, x1, x2, y});
}

export function barY(data, {x = indexOf, y, y1, y2, ...options} = {}) {
  ([y1, y2] = maybeZero(y, y1, y2));
  return new BarY(data, {...options, x, y1, y2});
}
