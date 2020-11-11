import {create} from "d3-selection";
import {area} from "d3-shape";

const indexOf = (d, i) => i;
const identity = d => d;
const zero = () => 0;

export class Area {
  constructor({
    x = indexOf,
    y = identity,
    y1 = zero,
    y2 = y,
    fill = "currentColor",
    fillOpacity
  } = {}) {
    this.fill = fill;
    this.fillOpacity = fillOpacity;
    this.channels = {
      x: {value: x, scale: "x"},
      y1: {value: y1, scale: "y"},
      y2: {value: y2, scale: "y"}
    };
  }
  render({x: {scale: x}, y: {scale: y}}) {
    const {
      channels: {
        x: {value: X},
        y1: {value: Y1},
        y2: {value: Y2}
      }
    } = this;
    const I = Array.from(X, (_, i) => i);
    return create("svg:path")
        .attr("fill", this.fill)
        .attr("fill-opacity", this.fillOpacity)
        .attr("d", area()
            .defined(i => X[i] != null && Y1[i] != null && Y2[i] != null) // TODO Number.isNaN?
            .x(i => x(X[i]))
            .y0(i => y(Y1[i]))
            .y1(i => y(Y2[i]))
          (I))
      .node();
  }
}
