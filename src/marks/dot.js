import {ascending} from "d3-array";
import {create} from "d3-selection";
import {defined, nonempty} from "../defined.js";
import {Mark, indexOf, identity, first, second, number} from "../mark.js";
import {applyDirectStyles, applyIndirectStyles, Style} from "../style.js";

export class Dot extends Mark {
  constructor(
    data,
    {
      x = first,
      y = second,
      z,
      r,
      title,
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
        {name: "title", value: title, optional: true},
        {name: "fill", value: fill, scale: "color", optional: true},
        {name: "stroke", value: stroke, scale: "color", optional: true}
      ]
    );
    this.style = Style({
      fill: fill === undefined ? "none" : undefined,
      stroke: stroke === undefined && fill === undefined && style.fill === undefined ? "currentColor" : undefined,
      strokeWidth: fill === undefined && style.fill === undefined ? 1.5 : undefined,
      ...style
    });
    this.style.r = style.r === undefined ? 3 : number(style.r);
  }
  render(
    I,
    {x, y, r, color},
    {x: X, y: Y, z: Z, r: R, title: L, fill: F, stroke: S}
  ) {
    const {style} = this;
    let index = I.filter(i => defined(X[i]) && defined(Y[i]));
    if (R) index = index.filter(i => defined(R[i]));
    if (F) index = index.filter(i => defined(F[i]));
    if (S) index = index.filter(i => defined(S[i]));
    if (Z) index.sort((i, j) => ascending(Z[i], Z[j]));
    return create("svg:g")
        .call(applyIndirectStyles, style)
        .call(g => g.selectAll()
          .data(index)
          .join("circle")
            .call(applyDirectStyles, style)
            .attr("cx", i => x(X[i]))
            .attr("cy", i => y(Y[i]))
            .attr("r", R ? i => r(R[i]) : style.r)
            .attr("fill", F && (i => color(F[i])))
            .attr("stroke", S && (i => color(S[i])))
            .call(L ? text => text
              .filter(i => nonempty(L[i]))
              .append("title")
              .text(i => L[i]) : () => {}))
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
