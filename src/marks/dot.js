import {ascending} from "d3-array";
import {create} from "d3-selection";
import {defined} from "../defined.js";
import {Mark, indexOf, identity} from "../mark.js";

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
    this.r = fixedR;
    this.fill = fixedFill;
    this.fillOpacity = fillOpacity;
    this.stroke = fixedStroke;
    this.strokeWidth = strokeWidth;
    this.strokeOpacity = strokeOpacity;
    this.mixBlendMode = mixBlendMode;
  }
  render(
    I,
    {
      x: {scale: x},
      y: {scale: y},
      r: {scale: r} = {},
      color: {scale: color} = {}
    }
  ) {
    const {
      fill,
      fillOpacity,
      stroke,
      strokeWidth,
      strokeOpacity,
      mixBlendMode,
      channels: {
        x: {value: X},
        y: {value: Y},
        z: {value: Z} = {},
        r: {value: R} = {},
        fill: {value: F} = {},
        stroke: {value: S} = {}
      }
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
