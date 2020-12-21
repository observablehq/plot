import {ascending} from "d3-array";
import {create} from "d3-selection";
import {zero} from "../mark.js";
import {filter} from "../defined.js";
import {Mark, number, maybeColor, title} from "../mark.js";
import {Style, applyDirectStyles, applyIndirectStyles, applyTransform} from "../style.js";

export class Rect extends Mark {
  constructor(
    data,
    {
      x1,
      y1,
      x2,
      y2,
      z,
      title,
      fill,
      stroke,
      insetTop = 0,
      insetRight = 0,
      insetBottom = 0,
      insetLeft = 0,
      transform,
      ...style
    } = {}
  ) {
    const [vfill, cfill] = maybeColor(fill);
    const [vstroke, cstroke] = maybeColor(stroke);
    super(
      data,
      [
        {name: "x1", value: x1, scale: "x"},
        {name: "y1", value: y1, scale: "y"},
        {name: "x2", value: x2, scale: "x"},
        {name: "y2", value: y2, scale: "y"},
        {name: "z", value: z, optional: true},
        {name: "title", value: title, optional: true},
        {name: "fill", value: vfill, scale: "color", optional: true},
        {name: "stroke", value: vstroke, scale: "color", optional: true}
      ],
      transform
    );
    Style(this, {fill: cfill, stroke: cstroke, ...style});
    this.insetTop = number(insetTop);
    this.insetRight = number(insetRight);
    this.insetBottom = number(insetBottom);
    this.insetLeft = number(insetLeft);
  }
  render(
    I,
    {x, y, color},
    {x1: X1, y1: Y1, x2: X2, y2: Y2, z: Z, title: L, fill: F, stroke: S}
  ) {
    const index = filter(I, X1, Y2, X2, Y2, F, S);
    if (Z) index.sort((i, j) => ascending(Z[i], Z[j]));
    return create("svg:g")
        .call(applyIndirectStyles, this)
        .call(applyTransform, x, y)
        .call(g => g.selectAll()
          .data(index)
          .join("rect")
            .call(applyDirectStyles, this)
            .attr("x", i => Math.min(x(X1[i]), x(X2[i])) + this.insetLeft)
            .attr("y", i => Math.min(y(Y1[i]), y(Y2[i])) + this.insetTop)
            .attr("width", i => Math.max(0, Math.abs(x(X2[i]) - x(X1[i])) - this.insetLeft - this.insetRight))
            .attr("height", i => Math.max(0, Math.abs(y(Y1[i]) - y(Y2[i])) - this.insetTop - this.insetBottom))
            .attr("fill", F && (i => color(F[i])))
            .attr("stroke", S && (i => color(S[i]))
            .call(title(L)))
      .node();
  }
}

export function rectX(data, {x, y1, y2, ...options} = {}) {
  return new Rect(data, {...options, x1: zero, x2: x, y1, y2});
}

export function rectY(data, {x1, x2, y, ...options} = {}) {
  return new Rect(data, {...options, x1, x2, y1: zero, y2: y});
}

export function rect(data, options) {
  return new Rect(data, options);
}
