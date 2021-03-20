import {ascending} from "d3";
import {create} from "d3";
import {filter, nonempty} from "../defined.js";
import {Mark, indexOf, identity, string, title, maybeColor, maybeNumber, maybeTuple} from "../mark.js";
import {Style, applyDirectStyles, applyIndirectStyles, applyAttr, applyStyle, applyTransform} from "../style.js";

export class Text extends Mark {
  constructor(
    data,
    {
      x,
      y,
      z,
      text = indexOf,
      title,
      fill,
      textAnchor,
      fontFamily,
      fontSize,
      fontStyle,
      fontVariant,
      fontWeight,
      dx,
      dy = "0.32em",
      rotate,
      ...options
    } = {}
  ) {
    const [vfill, cfill] = maybeColor(fill, "currentColor");
    const [vrotate, crotate] = maybeNumber(rotate, 0);
    super(
      data,
      [
        {name: "x", value: x, scale: "x", optional: true},
        {name: "y", value: y, scale: "y", optional: true},
        {name: "z", value: z, optional: true},
        {name: "rotate", value: vrotate, optional: true}, // TODO force Float64Array
        {name: "text", value: text},
        {name: "title", value: title, optional: true},
        {name: "fill", value: vfill, scale: "color", optional: true}
      ],
      options
    );
    Style(this, {fill: cfill, ...options});
    this.rotate = crotate;
    this.textAnchor = string(textAnchor);
    this.fontFamily = string(fontFamily);
    this.fontSize = string(fontSize);
    this.fontStyle = string(fontStyle);
    this.fontVariant = string(fontVariant);
    this.fontWeight = string(fontWeight);
    this.dx = string(dx);
    this.dy = string(dy);
  }
  render(
    I,
    {x, y, color},
    {x: X, y: Y, z: Z, rotate: R, text: T, title: L, fill: F},
    {width, height, marginTop, marginRight, marginBottom, marginLeft}
  ) {
    const {rotate} = this;
    const index = filter(I, X, Y, F, R).filter(i => nonempty(T[i]));
    if (Z) index.sort((i, j) => ascending(Z[i], Z[j]));
    const cx = (marginLeft + width - marginRight) / 2;
    const cy = (marginTop + height - marginBottom) / 2;
    return create("svg:g")
        .call(applyIndirectTextStyles, this)
        .call(applyTransform, x, y, 0.5, 0.5)
        .call(g => g.selectAll()
          .data(index)
          .join("text")
            .call(applyDirectTextStyles, this)
            .call(R ? text => text.attr("transform", X && Y ? i => `translate(${x(X[i])},${y(Y[i])}) rotate(${R[i]})`
                : X ? i => `translate(${x(X[i])},${cy}) rotate(${R[i]})`
                : Y ? i => `translate(${cx},${y(Y[i])}) rotate(${R[i]})`
                : i => `translate(${cx},${cy}) rotate(${R[i]})`)
              : rotate ? text => text.attr("transform", X && Y ? i => `translate(${x(X[i])},${y(Y[i])}) rotate(${rotate})`
                : X ? i => `translate(${x(X[i])},${cy}) rotate(${rotate})`
                : Y ? i => `translate(${cx},${y(Y[i])}) rotate(${rotate})`
                : `translate(${cx},${cy}) rotate(${rotate})`)
              : text => text.attr("x", X ? i => x(X[i]) : cx).attr("y", Y ? i => y(Y[i]) : cy))
            .attr("fill", F && (i => color(F[i])))
            .text(i => T[i])
            .call(title(L)))
      .node();
  }
}

export function text(data, {x, y, ...options} = {}) {
  ([x, y] = maybeTuple(x, y));
  return new Text(data, {...options, x, y});
}

export function textX(data, {x = identity, ...options} = {}) {
  return new Text(data, {...options, x});
}

export function textY(data, {y = identity, ...options} = {}) {
  return new Text(data, {...options, y});
}

function applyIndirectTextStyles(selection, mark) {
  applyIndirectStyles(selection, mark);
  applyAttr(selection, "text-anchor", mark.textAnchor);
  applyStyle(selection, "font-family", mark.fontFamily);
  applyStyle(selection, "font-size", mark.fontSize);
  applyStyle(selection, "font-style", mark.fontStyle);
  applyStyle(selection, "font-variant", mark.fontVariant);
  applyStyle(selection, "font-weight", mark.fontWeight);
}

function applyDirectTextStyles(selection, mark) {
  applyDirectStyles(selection, mark);
  applyAttr(selection, "dx", mark.dx);
  applyAttr(selection, "dy", mark.dy);
}
