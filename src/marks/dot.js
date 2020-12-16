import {ascending} from "d3-array";
import {create} from "d3-selection";
import {filter, nonempty, positive} from "../defined.js";
import {Mark, indexOf, identity, first, second, maybeColor, maybeNumber} from "../mark.js";
import {Style, applyDirectStyles, applyIndirectStyles, applyBandTransform} from "../style.js";

export class Dot extends Mark {
  constructor(
    data,
    {
      x = first,
      y = second,
      z,
      size,
      title,
      fill,
      stroke,
      transform,
      ...style
    } = {}
  ) {
    const [vsize, csize = vsize == null ? 27 : undefined] = maybeNumber(size);
    const [vfill, cfill = vfill == null ? "none" : undefined] = maybeColor(fill);
    const [vstroke, cstroke = vstroke == null && cfill === "none" ? "currentColor" : undefined] = maybeColor(stroke);
    super(
      data,
      [
        {name: "x", value: x, scale: "x"},
        {name: "y", value: y, scale: "y"},
        {name: "z", value: z, optional: true},
        {name: "size", value: vsize, scale: "size", optional: true},
        {name: "title", value: title, optional: true},
        {name: "fill", value: vfill, scale: "color", optional: true},
        {name: "stroke", value: vstroke, scale: "color", optional: true}
      ],
      transform
    );
    this.size = csize;
    Style(this, {
      fill: cfill,
      stroke: cstroke,
      strokeWidth: cstroke != null || vstroke != null ? 1.5 : undefined,
      ...style
    });
  }
  render(
    I,
    {x, y, size, color},
    {x: X, y: Y, z: Z, size: A, title: L, fill: F, stroke: S}
  ) {
    let index = filter(I, X, Y, F, S);
    if (A) index = index.filter(i => positive(A[i]));
    if (Z) index.sort((i, j) => ascending(Z[i], Z[j]));
    return create("svg:g")
        .call(applyIndirectStyles, this)
        .call(applyBandTransform, x, y)
        .call(g => g.selectAll()
          .data(index)
          .join("circle")
            .call(applyDirectStyles, this)
            .attr("cx", i => x(X[i]))
            .attr("cy", i => y(Y[i]))
            .attr("r", A ? i => radius(size(A[i])) : radius(this.size))
            .attr("fill", F && (i => color(F[i])))
            .attr("stroke", S && (i => color(S[i])))
            .call(L ? text => text
              .filter(i => nonempty(L[i]))
              .append("title")
              .text(i => L[i]) : () => {}))
      .node();
  }
}

function radius(area) {
  return Math.sqrt(area / 3);
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
