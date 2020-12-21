import {ascending} from "d3-array";
import {create} from "d3-selection";
import {filter, nonempty} from "../defined.js";
import {Mark, maybeColor} from "../mark.js";
import {Style, applyDirectStyles, applyIndirectStyles, applyTransform} from "../style.js";

export class Link extends Mark {
  constructor(
    data,
    {
      x1,
      y1,
      x2,
      y2,
      z,
      title,
      stroke,
      transform,
      ...style
    } = {}
  ) {
    const [vstroke, cstroke = vstroke == null ? "currentColor" : undefined] = maybeColor(stroke);
    super(
      data,
      [
        {name: "x1", value: x1, scale: "x"},
        {name: "y1", value: y1, scale: "y"},
        {name: "x2", value: x2, scale: "x"},
        {name: "y2", value: y2, scale: "y"},
        {name: "title", value: title, optional: true},
        {name: "z", value: z, optional: true},
        {name: "stroke", value: vstroke, scale: "color", optional: true}
      ],
      transform
    );
    Style(this, {stroke: cstroke, ...style});
  }
  render(
    I,
    {x, y, color},
    {x1: X1, y1: Y1, x2: X2, y2: Y2, z: Z, title: L, stroke: S}
  ) {
    const index = filter(I, X1, Y1, X2, Y2, S);
    if (Z) index.sort((i, j) => ascending(Z[i], Z[j]));
    return create("svg:g")
        .call(applyIndirectStyles, this)
        .call(applyTransform, x, y, 0.5, 0.5)
        .call(g => g.selectAll()
          .data(index)
          .join("line")
            .call(applyDirectStyles, this)
            .attr("x1", i => x(X1[i]))
            .attr("y1", i => y(Y1[i]))
            .attr("x2", i => x(X2[i]))
            .attr("y2", i => y(Y2[i]))
            .attr("stroke", S && (i => color(S[i])))
          .call(L ? marks => marks
            .filter(i => nonempty(L[i]))
            .append("title")
            .text(i => L[i]) : () => {}))
      .node();
  }
}

export function link(data, options) {
  return new Link(data, options);
}
