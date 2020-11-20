import {create} from "d3-selection";
import {area} from "d3-shape";
import {Curve} from "../curve.js";
import {identity, indexOf, zero} from "../mark.js";
import {defined} from "../defined.js";
import {Mark} from "../mark.js";

export class Area extends Mark {
  constructor(
    data,
    {
      x1,
      y1,
      x2,
      y2
    } = {},
    {
      curve,
      fill = "currentColor",
      fillOpacity
    } = {}
  ) {
    super(
      data,
      [
        {name: "x1", value: x1, scale: "x"},
        {name: "y1", value: y1, scale: "y"},
        {name: "x2", value: x2, scale: "x", optional: true},
        {name: "y2", value: y2, scale: "y", optional: true}
      ]
    );
    this.curve = Curve(curve);
    this.fill = fill;
    this.fillOpacity = fillOpacity;
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

export function area(data, channels, style) {
  return new Area(data, channels, style);
}

export function areaX(data, {x, x1, x2, y = indexOf} = {}, style) {
  if (x1 === undefined && x2 === undefined) { // {x} or {}
    x1 = zero, x2 = x === undefined ? identity : x;
  } else if (x1 === undefined) { // {x, x2} or {x2}
    x1 = x === undefined ? zero : x;
  } else if (x2 === undefined) { // {x, x1} or {x1}
    x2 = x === undefined ? zero : x;
  }
  return new Area(data, {x1, x2, y1: y}, style);
}

export function areaY(data, {x = indexOf, y, y1, y2} = {}, style) {
  if (y1 === undefined && y2 === undefined) { // {y} or {}
    y1 = zero, y2 = y === undefined ? identity : y;
  } else if (y1 === undefined) { // {y, y2} or {y2}
    y1 = y === undefined ? zero : y;
  } else if (y2 === undefined) { // {y, y1} or {y1}
    y2 = y === undefined ? zero : y;
  }
  return new Area(data, {x1: x, y1, y2}, style);
}
