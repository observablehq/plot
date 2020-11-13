import {create} from "d3-selection";
import {area} from "d3-shape";

const indexOf = (d, i) => i;
const identity = d => d;
const zero = () => 0;

class Area {
  constructor({
    x1,
    y1,
    x2,
    y2,
    fill = "currentColor",
    fillOpacity
  } = {}) {
    this.fill = fill;
    this.fillOpacity = fillOpacity;
    this.channels = {
      x1: {value: x1, scale: "x"},
      y1: {value: y1, scale: "y"},
      x2: x2 && {value: x2, scale: "x"},
      y2: y2 && {value: y2, scale: "y"}
    };
  }
  render({x: {scale: x}, y: {scale: y}}) {
    const {
      channels: {
        x1: {value: X1},
        y1: {value: Y1},
        x2: {value: X2} = {value: X1},
        y2: {value: Y2} = {value: Y1}
      }
    } = this;
    const I = Array.from(X1, (_, i) => i);
    const {length} = X1;
    if (length !== Y1.length) throw new Error("X1 and Y1 are different length");
    if (length !== X2.length) throw new Error("X1 and X2 are different length");
    if (length !== Y2.length) throw new Error("X1 and Y2 are different length");
    return create("svg:path")
        .attr("fill", this.fill)
        .attr("fill-opacity", this.fillOpacity)
        .attr("d", area()
            .defined(i => X1[i] != null // TODO Number.isNaN?
              && Y1[i] != null
              && X2[i] != null
              && Y2[i] != null)
            .x0(i => x(X1[i]))
            .y0(i => y(Y1[i]))
            .x1(i => x(X2[i]))
            .y1(i => y(Y2[i]))
          (I))
      .node();
  }
}

export class AreaX extends Area {
  constructor({x = identity, x1 = zero, x2 = x, y = indexOf, ...options} = {}) {
    super({...options, x1, x2, y1: y, y2: null});
  }
}

export class AreaY extends Area {
  constructor({x = indexOf, y = identity, y1 = zero, y2 = y, ...options} = {}) {
    super({...options, x1: x, x2: null, y1, y2});
  }
}
