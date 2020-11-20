import {group} from "d3-array";
import {create} from "d3-selection";
import {line} from "d3-shape";
import {Curve} from "../curve.js";
import {defined} from "../defined.js";
import {Mark, indexOf, identity} from "../mark.js";

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
    this.fill = fill;
    this.fillOpacity = fillOpacity;
    this.stroke = stroke;
    this.strokeWidth = strokeWidth;
    this.strokeMiterlimit = strokeMiterlimit;
    this.strokeLinecap = strokeLinecap;
    this.strokeLinejoin = strokeLinejoin;
    this.strokeDasharray = strokeDasharray;
    this.strokeOpacity = strokeOpacity;
    this.mixBlendMode = mixBlendMode;
  }
  render(I, {x: {scale: x}, y: {scale: y}}) {
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
      mixBlendMode,
      channels: {
        x: {value: X},
        y: {value: Y},
        z: {value: Z} = {}
      }
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
            .attr("d", line()
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

export function lineX(data, {x = identity, z} = {}, style) {
  return new Line(data, {x, y: indexOf, z}, style);
}

export function lineY(data, {y = identity, z} = {}, style) {
  return new Line(data, {x: indexOf, y, z}, style);
}
