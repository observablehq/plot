import {create} from "d3";
import {filter, nonempty} from "../defined.js";
import {Mark, indexOf, identity, string, maybeNumber, maybeTuple, numberChannel} from "../mark.js";
import {applyChannelStyles, applyDirectStyles, applyIndirectStyles, applyAttr, applyTransform} from "../style.js";

const defaults = {};

export class Text extends Mark {
  constructor(data, options = {}) {
    const {
      x,
      y,
      text = indexOf,
      textAnchor,
      fontFamily,
      fontSize,
      fontStyle,
      fontVariant,
      fontWeight,
      dx,
      dy = "0.32em",
      rotate
    } = options;
    const [vrotate, crotate] = maybeNumber(rotate, 0);
    const [vfontSize, cfontSize] = maybeNumber(fontSize);
    super(
      data,
      [
        {name: "x", value: x, scale: "x", optional: true},
        {name: "y", value: y, scale: "y", optional: true},
        {name: "fontSize", value: numberChannel(vfontSize), optional: true},
        {name: "rotate", value: numberChannel(vrotate), optional: true},
        {name: "text", value: text}
      ],
      options,
      defaults
    );
    this.rotate = crotate;
    this.textAnchor = string(textAnchor);
    this.fontFamily = string(fontFamily);
    this.fontSize = cfontSize;
    this.fontStyle = string(fontStyle);
    this.fontVariant = string(fontVariant);
    this.fontWeight = string(fontWeight);
    this.dx = string(dx);
    this.dy = string(dy);
  }
  render(
    I,
    {x, y},
    channels,
    {width, height, marginTop, marginRight, marginBottom, marginLeft}
  ) {
    const {x: X, y: Y, rotate: R, text: T, fontSize: FS} = channels;
    const {rotate} = this;
    const index = filter(I, X, Y, R).filter(i => nonempty(T[i]));
    const cx = (marginLeft + width - marginRight) / 2;
    const cy = (marginTop + height - marginBottom) / 2;
    return create("svg:g")
        .call(applyIndirectTextStyles, this)
        .call(applyTransform, x, y, 0.5, 0.5)
        .call(g => g.selectAll()
          .data(index)
          .join("text")
            .call(applyDirectTextStyles, this)
            .call(R ? text => text.attr("transform", X && Y ? i => `translate(${X[i]},${Y[i]}) rotate(${R[i]})`
                : X ? i => `translate(${X[i]},${cy}) rotate(${R[i]})`
                : Y ? i => `translate(${cx},${Y[i]}) rotate(${R[i]})`
                : i => `translate(${cx},${cy}) rotate(${R[i]})`)
              : rotate ? text => text.attr("transform", X && Y ? i => `translate(${X[i]},${Y[i]}) rotate(${rotate})`
                : X ? i => `translate(${X[i]},${cy}) rotate(${rotate})`
                : Y ? i => `translate(${cx},${Y[i]}) rotate(${rotate})`
                : `translate(${cx},${cy}) rotate(${rotate})`)
              : text => text.attr("x", X ? i => X[i] : cx).attr("y", Y ? i => Y[i] : cy))
            .call(applyAttr, "font-size", FS && (i => FS[i]))
            .text(i => T[i])
            .call(applyChannelStyles, channels))
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
  applyAttr(selection, "font-family", mark.fontFamily);
  applyAttr(selection, "font-size", mark.fontSize);
  applyAttr(selection, "font-style", mark.fontStyle);
  applyAttr(selection, "font-variant", mark.fontVariant);
  applyAttr(selection, "font-weight", mark.fontWeight);
}

function applyDirectTextStyles(selection, mark) {
  applyDirectStyles(selection, mark);
  applyAttr(selection, "dx", mark.dx);
  applyAttr(selection, "dy", mark.dy);
}
