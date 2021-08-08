import { create } from "d3";
import { filter, positive } from "../defined.js";
import { Mark, maybeNumber, maybeTuple, title } from "../mark.js";
import {
  Style,
  applyDirectStyles,
  applyIndirectStyles,
  applyTransform,
  applyAttr
} from "../style.js";

export class Image extends Mark {
  constructor(data, { x, y, href, r, title, ...options } = {}) {
    const [vr, cr] = maybeNumber(r, 15);
    super(
      data,
      [
        { name: "x", value: x, scale: "x", optional: true },
        { name: "y", value: y, scale: "y", optional: true },
        {name: "r", value: vr, scale: "r", optional: true},
        { name: 'href', value: href, optional: false },
        { name: "title", value: title, optional: true }
      ],
      options
    );
    this.r = cr;
    Style(this, {
      ...options
    });
  }
  render(
    I,
    { x, y },
    { x: X, y: Y, href: H, r: R, title: L },
    { width, height, marginTop, marginRight, marginBottom, marginLeft }
  ) {
    let index = filter(I, X, Y, R, H);
    if (R) index = index.filter((i) => positive(R[i]));
    return create("svg:g")
      .call(applyIndirectStyles, this)
      .call(applyTransform, x, y, 0.5, 0.5)
      .call((g) =>
        g
          .selectAll()
          .data(index)
          .join("image")
          .call(applyDirectStyles, this)
          .attr("x", X ? (i) => X[i] : (marginLeft + width - marginRight) / 2)
          .attr("y", Y ? (i) => Y[i] : (marginTop + height - marginBottom) / 2)
          .attr("width", R ? (i) => R[i] * 2 : this.r * 2)
          .attr("height", R ? (i) => R[i] * 2 : this.r * 2)
          .call(applyAttr, "href", H && (i => H[i]))
          .call(
            applyAttr,
            "transform",
            i => `translate(${[-(R ? R[i] : this.r), -(R ? R[i] : this.r)]})`
          )
          .call(title(L))
      )
      .node();
  }
}

export function image(data, { x, y, ...options } = {}) {
  [x, y] = maybeTuple(x, y);
  return new Image(data, { ...options, x, y });
}
