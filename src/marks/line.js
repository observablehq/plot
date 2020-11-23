import {group} from "d3-array";
import {create} from "d3-selection";
import {line as shapeLine} from "d3-shape";
import {Curve} from "../curve.js";
import {defined} from "../defined.js";
import {Mark, indexOf, identity, string, number} from "../mark.js";

export class Line extends Mark {
  constructor(
    data,
    {
      x,
      y,
      z // optional grouping for multiple series
    } = {},
    {
      curve,
      fill = "none",
      fillOpacity,
      stroke = "currentColor",
      strokeWidth = z ? 1 : 1.5,
      strokeMiterlimit = 1,
      strokeLinecap,
      strokeLinejoin,
      strokeDasharray,
      strokeOpacity,
      mixBlendMode
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
    this.fill = string(fill);
    this.fillOpacity = number(fillOpacity);
    this.stroke = string(stroke);
    this.strokeWidth = number(strokeWidth);
    this.strokeMiterlimit = string(strokeMiterlimit);
    this.strokeLinecap = string(strokeLinecap);
    this.strokeLinejoin = string(strokeLinejoin);
    this.strokeDasharray = string(strokeDasharray);
    this.strokeOpacity = number(strokeOpacity);
    this.mixBlendMode = string(mixBlendMode);
  }
  render(I, {x, y}, {x: X, y: Y, z: Z}) {
    const {
      curve,
      fill,
      fillOpacity,
      stroke,
      strokeWidth,
      strokeMiterlimit,
      strokeLinecap,
      strokeLinejoin,
      strokeDasharray,
      strokeOpacity,
      mixBlendMode
    } = this;
    return create("svg:g")
        .attr("fill", fill)
        .attr("fill-opacity", fillOpacity)
        .attr("stroke", stroke)
        .attr("stroke-width", strokeWidth)
        .attr("stroke-miterlimit", strokeMiterlimit)
        .attr("stroke-linecap", strokeLinecap)
        .attr("stroke-linejoin", strokeLinejoin)
        .attr("stroke-dasharray", strokeDasharray)
        .attr("stroke-opacity", strokeOpacity)
        .call(g => g.selectAll()
          .data(Z ? group(I, i => Z[i]).values() : [I])
          .join("path")
            .style("mix-blend-mode", mixBlendMode)
            .attr("d", shapeLine()
              .curve(curve)
              .defined(i => defined(X[i]) && defined(Y[i]))
              .x(i => x(X[i]))
              .y(i => y(Y[i]))))
      .node();
  }
}

export function line(data, channels, style) {
  return new Line(data, channels, style);
}

// TODO Error if y is specified?
export function lineX(data, {x = identity, z} = {}, style) {
  return new Line(data, {x, y: indexOf, z}, style);
}

// TODO Error if x is specified?
export function lineY(data, {y = identity, z} = {}, style) {
  return new Line(data, {x: indexOf, y, z}, style);
}
