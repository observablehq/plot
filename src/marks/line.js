import {group} from "d3-array";
import {create} from "d3-selection";
import {line as shapeLine} from "d3-shape";
import {Curve} from "../curve.js";
import {defined} from "../defined.js";
import {Mark, indexOf, identity} from "../mark.js";
import {Style, applyIndirectStyles, applyDirectStyles} from "../style.js";

export class Line extends Mark {
  constructor(
    data,
    {
      x,
      y,
      z, // optional grouping for multiple series
      curve,
      style
    } = {}
  ) {
    super(
      data,
      [
        {name: "x", value: x, scale: "x"},
        {name: "y", value: y, scale: "y"},
        {name: "z", value: z, optional: true}
      ]
    );
    this.curve = Curve(curve);
    this.style = Style({
      fill: "none",
      stroke: "currentColor",
      strokeWidth: z ? 1 : 1.5,
      ...style
    });
  }
  render(I, {x, y}, {x: X, y: Y, z: Z}) {
    const {curve, style} = this;
    return create("svg:g")
        .call(applyIndirectStyles, style)
        .call(g => g.selectAll()
          .data(Z ? group(I, i => Z[i]).values() : [I])
          .join("path")
            .call(applyDirectStyles, style)
            .attr("d", shapeLine()
              .curve(curve)
              .defined(i => defined(X[i]) && defined(Y[i]))
              .x(i => x(X[i]))
              .y(i => y(Y[i]))))
      .node();
  }
}

export function line(data, options) {
  return new Line(data, options);
}

// TODO Error if y is specified?
export function lineX(data, {x = identity, ...options} = {}) {
  return new Line(data, {...options, x, y: indexOf});
}

// TODO Error if x is specified?
export function lineY(data, {y = identity, ...options} = {}) {
  return new Line(data, {...options, x: indexOf, y});
}
