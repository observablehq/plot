import {create} from "d3-selection";
import {area} from "d3-shape";
import {Curve} from "../curve.js";
import {identity, indexOf, zero} from "../channels.js";
import {defined} from "../defined.js";

class Area {
  constructor(
    data,
    {
      x1,
      y1,
      x2,
      y2,
      curve,
      fill = "currentColor",
      fillOpacity
    } = {}
  ) {
    this.data = data;
    this.curve = Curve(curve);
    this.fill = fill;
    this.fillOpacity = fillOpacity;
    this.channels = {
      x1: {value: x1, scale: "x"},
      y1: {value: y1, scale: "y"},
      x2: x2 && {value: x2, scale: "x"},
      y2: y2 && {value: y2, scale: "y"}
    };
  }
  render(I, {x: {scale: x}, y: {scale: y}}) {
    const {
      curve,
      channels: {
        x1: {value: X1},
        y1: {value: Y1},
        x2: {value: X2} = {value: X1},
        y2: {value: Y2} = {value: Y1}
      }
    } = this;
    const {length} = X1;
    if (length !== Y1.length) throw new Error("X1 and Y1 are different length");
    if (length !== X2.length) throw new Error("X1 and X2 are different length");
    if (length !== Y2.length) throw new Error("X1 and Y2 are different length");
    return create("svg:path")
        .attr("fill", this.fill)
        .attr("fill-opacity", this.fillOpacity)
        .attr("d", area()
            .curve(curve)
            .defined(i => defined(X1[i]) && defined(Y1[i]) && defined(X2[i]) && defined(Y2[i]))
            .x0(i => x(X1[i]))
            .y0(i => y(Y1[i]))
            .x1(i => x(X2[i]))
            .y1(i => y(Y2[i]))
          (I))
      .node();
  }
}

export class AreaX extends Area {
  constructor(data, {x = identity, x1 = zero, x2 = x, y = indexOf, ...options} = {}) {
    super(data, {...options, x1, x2, y1: y, y2: null});
  }
}

export class AreaY extends Area {
  constructor(data, {x = indexOf, y = identity, y1 = zero, y2 = y, ...options} = {}) {
    super(data, {...options, x1: x, x2: null, y1, y2});
  }
}
