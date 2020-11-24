import {ascending} from "d3-array";
import {create} from "d3-selection";
import {defined} from "../defined.js";
import {Mark, indexOf, identity} from "../mark.js";
import {applyDirectStyles, applyIndirectStyles, Style} from "../style.js";

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
      stroke,
      style = {}
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
    this.style = Style({
      fill: fill === undefined ? "none" : undefined,
      stroke: stroke === undefined && !fill ? "currentColor" : undefined,
      strokeWidth: 1.5,
      ...style
    });
    this.r = style.r === undefined ? 3 : +style.r;
  }
  render(
    I,
    {x, y, r, color},
    {x: X, y: Y, z: Z, r: R, fill: F, stroke: S}
  ) {
    const {style} = this;
    const index = I.filter(i => defined(X[i]) && defined(Y[i]));
    if (Z) index.sort((i, j) => ascending(Z[i], Z[j]));
    return create("svg:g")
        .call(applyIndirectStyles, style)
        .call(g => g.selectAll()
          .data(index)
          .join("circle")
            .call(applyDirectStyles, style)
            .attr("cx", i => x(X[i]))
            .attr("cy", i => y(Y[i]))
            .attr("r", R ? i => r(R[i]) : this.r)
            .attr("fill", F && (i => color(F[i])))
            .attr("stroke", S && (i => color(S[i]))))
      .node();
  }
}

export function dot(data, channels, style) {
  return new Dot(data, channels, style);
}

export function dotX(data, {x = identity, ...options} = {}) {
  return new Dot(data, {...options, x, y: indexOf});
}

export function dotY(data, {y = identity, ...options} = {}) {
  return new Dot(data, {...options, x: indexOf, y});
}
