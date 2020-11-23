import {ascending} from "d3-array";
import {create} from "d3-selection";
import {defined} from "../defined.js";
import {Mark, indexOf, identity, string, number} from "../mark.js";

const first = d => d[0];
const second = d => d[1];

export class Dot extends Mark {
  constructor(
    data,
    {
      x = first,
      y = second,
      z,
      r,
      fill,
      stroke
    } = {},
    {
      r: fixedR = r === undefined ? 3 : undefined,
      fill: fixedFill = fill === undefined ? "none" : undefined,
      fillOpacity,
      stroke: fixedStroke = stroke === undefined && !fill ? "currentColor" : undefined,
      strokeWidth = 1.5,
      strokeOpacity,
      mixBlendMode
    } = {}
  ) {
    super(
      data,
      [
        {name: "x", value: x, scale: "x"},
        {name: "y", value: y, scale: "y"},
        {name: "z", value: z, optional: true},
        {name: "r", value: r, scale: "r", optional: true},
        {name: "fill", value: fill, scale: "color", optional: true},
        {name: "stroke", value: stroke, scale: "color", optional: true}
      ]
    );
    this.r = number(fixedR);
    this.fill = string(fixedFill);
    this.fillOpacity = number(fillOpacity);
    this.stroke = string(fixedStroke);
    this.strokeWidth = number(strokeWidth);
    this.strokeOpacity = number(strokeOpacity);
    this.mixBlendMode = string(mixBlendMode);
  }
  render(
    I,
    {x, y, r, color},
    {x: X, y: Y, z: Z, r: R, fill: F, stroke: S}
  ) {
    const {
      fill,
      fillOpacity,
      stroke,
      strokeWidth,
      strokeOpacity,
      mixBlendMode
    } = this;
    const index = I.filter(i => defined(X[i]) && defined(Y[i]));
    if (Z) index.sort((i, j) => ascending(Z[i], Z[j]));
    return create("svg:g")
        .attr("fill", fill)
        .attr("fill-opacity", fillOpacity)
        .attr("stroke", stroke)
        .attr("stroke-width", strokeWidth)
        .attr("stroke-opacity", strokeOpacity)
        .call(g => g.selectAll()
          .data(index)
          .join("circle")
            .style("mix-blend-mode", mixBlendMode)
            .attr("fill", F && (i => color(F[i])))
            .attr("stroke", S && (i => color(S[i])))
            .attr("cx", i => x(X[i]))
            .attr("cy", i => y(Y[i]))
            .attr("r", R ? i => r(R[i]) : this.r))
      .node();
  }
}

export function dot(data, channels, style) {
  return new Dot(data, channels, style);
}

export function dotX(data, {x = identity, y, ...channels} = {}, style) {
  y; // hard-coded channel
  return new Dot(data, {x, y: indexOf, ...channels}, style);
}

export function dotY(data, {x, y = identity, ...channels} = {}, style) {
  x; // hard-coded channel
  return new Dot(data, {x: indexOf, y, ...channels}, style);
}
