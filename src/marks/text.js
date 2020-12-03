import {ascending} from "d3-array";
import {create} from "d3-selection";
import {defined, nonempty} from "../defined.js";
import {Mark, indexOf, identity, string, maybeColor} from "../mark.js";
import {Style, applyDirectStyles, applyIndirectStyles, applyAttr} from "../style.js";

const first = d => d[0];
const second = d => d[1];

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
    const [vfill, cfill] = maybeColor(fill);
    super(
      data,
      [
        {name: "x", value: x, scale: "x"},
        {name: "y", value: y, scale: "y"},
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
    {x: X, y: Y, z: Z, text: T, title: L, fill: F}
  ) {
    let index = I.filter(i => defined(X[i]) && defined(Y[i]) && nonempty(T[i]));
    if (F) index = index.filter(i => defined(F[i]));
    if (Z) index.sort((i, j) => ascending(Z[i], Z[j]));
    return create("svg:g")
        .call(applyIndirectStyles, this)
        .attr("transform", `translate(${
          x.bandwidth ? x.bandwidth() / 2 : 0},${
          y.bandwidth ? y.bandwidth() / 2 : 0})`)
        .call(g => g.selectAll()
          .data(index)
          .join("text")
            .call(applyDirectStyles, this)
            .call(applyTextStyles, this)
            .attr("x", i => x(X[i]))
            .attr("y", i => y(Y[i]))
            .attr("fill", F && (i => color(F[i])))
            .text(i => T[i])
          .call(L ? text => text
            .filter(i => nonempty(L[i]))
            .append("title")
            .text(i => L[i]) : () => {}))
      .node();
  }
}

export function text(data, options) {
  return new Text(data, options);
}

export function textX(data, {x = identity, ...options} = {}) {
  return new Text(data, {...options, x, y: indexOf});
}

export function textY(data, {y = identity, ...options} = {}) {
  return new Text(data, {...options, x: indexOf, y});
}

function applyTextStyles(selection, style) {
  applyAttr(selection, "text-anchor", style.textAnchor);
  applyAttr(selection, "dx", style.dx);
  applyAttr(selection, "dy", style.dy);
}
