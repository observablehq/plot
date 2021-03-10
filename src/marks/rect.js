import {ascending} from "d3";
import {create} from "d3";
import {filter} from "../defined.js";
import {Mark, number, maybeColor, maybeZero, title} from "../mark.js";
import {Style, applyDirectStyles, applyIndirectStyles, applyTransform, impliedString} from "../style.js";

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
      inset = 0,
      insetTop = inset,
      insetRight = inset,
      insetBottom = inset,
      insetLeft = inset,
      rx,
      ry,
      ...options
    } = {}
  ) {
    const [vstroke, cstroke] = maybeColor(stroke, "none");
    const [vfill, cfill] = maybeColor(fill, cstroke === "none" ? "currentColor" : "none");
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
      options
    );
    Style(this, {fill: cfill, stroke: cstroke, ...options});
    this.insetTop = number(insetTop);
    this.insetRight = number(insetRight);
    this.insetBottom = number(insetBottom);
    this.insetLeft = number(insetLeft);
    this.rx = impliedString(rx, "auto"); // number of percentage
    this.ry = impliedString(ry, "auto");
  }
  render(
    I,
    {x, y, color},
    {x1: X1, y1: Y1, x2: X2, y2: Y2, z: Z, title: L, fill: F, stroke: S}
  ) {
    const {rx, ry} = this;
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
            .call(rx != null ? rect => rect.attr("rx", rx) : () => {})
            .call(ry != null ? rect => rect.attr("ry", ry) : () => {})
            .attr("fill", F && (i => color(F[i])))
            .attr("stroke", S && (i => color(S[i])))
            .call(title(L)))
      .node();
  }
}

export function rect(data, options) {
  return new Rect(data, options);
}

export function rectX(data, {x, x1, x2, y1, y2, ...options} = {}) {
  ([x1, x2] = maybeZero(x, x1, x2));
  return new Rect(data, {...options, x1, x2, y1, y2});
}

export function rectY(data, {x1, x2, y, y1, y2, ...options} = {}) {
  ([y1, y2] = maybeZero(y, y1, y2));
  return new Rect(data, {...options, x1, x2, y1, y2});
}
