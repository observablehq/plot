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
  constructor(data, { x, y, href, size, title, ...options } = {}) {
    const [vsize, csize] = maybeNumber(size, 20);
    super(
      data,
      [
        { name: "x", value: x, scale: "x", optional: true },
        { name: "y", value: y, scale: "y", optional: true },
        { name: 'href', value: href, optional: false },
        { name: "size", value: vsize, optional: true },
        { name: "title", value: title, optional: true }
      ],
      options
    );
    this.size = csize;
    Style(this, {
      ...options
    });
  }
  render(
    I,
    { x, y },
    { x: X, y: Y, href: H, size: S, title: L },
    { width, height, marginTop, marginRight, marginBottom, marginLeft }
  ) {
    let index = filter(I, X, Y, S, H);
    if (S) index = index.filter((i) => positive(S[i]));
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
          .attr("width", S ? (i) => S[i] : this.size)
          .attr("height", S ? (i) => S[i] : this.size)
          .call(applyAttr, "href", H && (i => H[i]))
          .call(
            applyAttr,
            "transform",
            i => `translate(${[-(S ? S[i] : this.size) / 2, -(S ? S[i] : this.size) / 2]})`
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
