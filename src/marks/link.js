import {create} from "d3";
import {filter} from "../defined.js";
import {Mark, maybeColor, maybeNumber, title} from "../mark.js";
import {Style, applyDirectStyles, applyIndirectStyles, applyTransform, applyAttr} from "../style.js";

export class Link extends Mark {
  constructor(
    data,
    {
      x1,
      y1,
      x2,
      y2,
      title,
      stroke,
      strokeOpacity,
      ...options
    } = {}
  ) {
    const [vstroke, cstroke] = maybeColor(stroke, "currentColor");
    const [vstrokeOpacity, cstrokeOpacity] = maybeNumber(strokeOpacity);
    super(
      data,
      [
        {name: "x1", value: x1, scale: "x"},
        {name: "y1", value: y1, scale: "y"},
        {name: "x2", value: x2, scale: "x"},
        {name: "y2", value: y2, scale: "y"},
        {name: "title", value: title, optional: true},
        {name: "stroke", value: vstroke, scale: "color", optional: true},
        {name: "strokeOpacity", value: vstrokeOpacity, scale: "opacity", optional: true}
      ],
      options
    );
    Style(this, {
      stroke: cstroke,
      strokeOpacity: cstrokeOpacity,
      ...options
    });
  }
  render(
    I,
    {x, y},
    {x1: X1, y1: Y1, x2: X2, y2: Y2, title: L, stroke: S, strokeOpacity: SO}
  ) {
    const index = filter(I, X1, Y1, X2, Y2, S, SO);
    return create("svg:g")
        .call(applyIndirectStyles, this)
        .call(applyTransform, x, y, 0.5, 0.5)
        .call(g => g.selectAll()
          .data(index)
          .join("line")
            .call(applyDirectStyles, this)
            .attr("x1", i => X1[i])
            .attr("y1", i => Y1[i])
            .attr("x2", i => X2[i])
            .attr("y2", i => Y2[i])
            .call(applyAttr, "stroke", S && (i => S[i]))
            .call(applyAttr, "stroke-opacity", SO && (i => SO[i]))
            .call(title(L)))
      .node();
  }
}

export function link(data, options) {
  return new Link(data, options);
}
