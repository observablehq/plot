import {ascending} from "d3-array";
import {create} from "d3-selection";
import {filter, positive} from "../defined.js";
import {Mark, indexOf, identity, first, second, maybeColor, maybeNumber, title} from "../mark.js";
import {Style, applyDirectStyles, applyIndirectStyles, applyTransform} from "../style.js";

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
      transform,
      ...style
    } = {}
  ) {
    const [vr, cr = vr == null ? 3 : undefined] = maybeNumber(r);
    const [vfill, cfill = vfill == null ? "none" : undefined] = maybeColor(fill);
    const [vstroke, cstroke = vstroke == null && cfill === "none" ? "currentColor" : undefined] = maybeColor(stroke);
    super(
      data,
      [
        {name: "x", value: x, scale: "x"},
        {name: "y", value: y, scale: "y"},
        {name: "z", value: z, optional: true},
        {name: "r", value: vr, scale: "r", optional: true},
        {name: "title", value: title, optional: true},
        {name: "fill", value: vfill, scale: "color", optional: true},
        {name: "stroke", value: vstroke, scale: "color", optional: true}
      ],
      transform
    );
    this.r = cr;
    Style(this, {
      fill: cfill,
      stroke: cstroke,
      strokeWidth: cstroke != null || vstroke != null ? 1.5 : undefined,
      ...style
    });
  }
  render(
    I,
    {x, y, r, color},
    {x: X, y: Y, z: Z, r: R, title: L, fill: F, stroke: S}
  ) {
    let index = filter(I, X, Y, F, S);
    if (R) index = index.filter(i => positive(R[i]));
    if (Z) index.sort((i, j) => ascending(Z[i], Z[j]));
    return create("svg:g")
        .call(applyIndirectStyles, this)
        .call(applyTransform, x, y, 0.5, 0.5)
        .call(g => g.selectAll()
          .data(index)
          .join("circle")
            .call(applyDirectStyles, this)
            .attr("cx", i => x(X[i]))
            .attr("cy", i => y(Y[i]))
            .attr("r", R ? i => r(R[i]) : this.r)
            .attr("fill", F && (i => color(F[i])))
            .attr("stroke", S && (i => color(S[i])))
            .call(title(L)))
      .node();
  }
}

export function dot(data, options) {
  return new Dot(data, options);
}

export function dotX(data, {x = identity, ...options} = {}) {
  return new Dot(data, {...options, x, y: indexOf});
}

export function dotY(data, {y = identity, ...options} = {}) {
  return new Dot(data, {...options, x: indexOf, y});
}
