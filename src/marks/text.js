import {ascending} from "d3-array";
import {create} from "d3-selection";
import {filter, nonempty} from "../defined.js";
import {Mark, indexOf, identity, string, title, maybeColor, first, second} from "../mark.js";
import {Style, applyDirectStyles, applyIndirectStyles, applyAttr, applyTransform} from "../style.js";

export class Text extends Mark {
  constructor(
    data,
    {
      x = first,
      y = second,
      z,
      text = indexOf,
      title,
      fill,
      transform,
      textAnchor,
      dx,
      dy = "0.32em",
      ...style
    } = {}
  ) {
    const [vfill, cfill] = maybeColor(fill, "currentColor");
    super(
      data,
      [
        {name: "x", value: x, scale: "x", optional: true},
        {name: "y", value: y, scale: "y", optional: true},
        {name: "z", value: z, optional: true},
        {name: "text", value: text},
        {name: "title", value: title, optional: true},
        {name: "fill", value: vfill, scale: "color", optional: true}
      ],
      transform
    );
    Style(this, {fill: cfill, ...style});
    this.textAnchor = string(textAnchor);
    this.dx = string(dx);
    this.dy = string(dy);
  }
  render(
    I,
    {x, y, color},
    {x: X, y: Y, z: Z, text: T, title: L, fill: F},
    {width, height, marginTop, marginRight, marginBottom, marginLeft}
  ) {
    const index = filter(I, X, Y, F).filter(i => nonempty(T[i]));
    if (Z) index.sort((i, j) => ascending(Z[i], Z[j]));
    return create("svg:g")
        .call(applyIndirectStyles, this)
        .call(applyTransform, x, y, 0.5, 0.5)
        .call(g => g.selectAll()
          .data(index)
          .join("text")
            .call(applyDirectStyles, this)
            .call(applyTextStyles, this)
            .attr("x", X ? i => x(X[i]) : (marginLeft + width - marginRight) / 2)
            .attr("y", Y ? i => y(Y[i]) : (marginTop + height - marginBottom) / 2)
            .attr("fill", F && (i => color(F[i])))
            .text(i => T[i])
            .call(title(L)))
      .node();
  }
}

export function text(data, options) {
  return new Text(data, options);
}

export function textX(data, {x = identity, ...options} = {}) {
  return new Text(data, {...options, x, y: null});
}

export function textY(data, {y = identity, ...options} = {}) {
  return new Text(data, {...options, y, x: null});
}

function applyTextStyles(selection, style) {
  applyAttr(selection, "text-anchor", style.textAnchor);
  applyAttr(selection, "dx", style.dx);
  applyAttr(selection, "dy", style.dy);
}
