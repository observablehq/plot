import {create} from "d3";
import {nonempty} from "../defined.js";
import {indexOf, identity, string, maybeNumberChannel, maybeTuple, numberChannel, isNumeric, isTemporal} from "../options.js";
import {Mark} from "../plot.js";
import {applyChannelStyles, applyDirectStyles, applyIndirectStyles, applyAttr, applyText, applyTransform, offset} from "../style.js";

const defaults = {
  strokeLinejoin: "round"
};

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
    const [vrotate, crotate] = maybeNumberChannel(rotate, 0);
    const [vfontSize, cfontSize] = maybeNumberChannel(fontSize);
    super(
      data,
      [
        {name: "x", value: x, scale: "x", optional: true},
        {name: "y", value: y, scale: "y", optional: true},
        {name: "fontSize", value: numberChannel(vfontSize), optional: true},
        {name: "rotate", value: numberChannel(vrotate), optional: true},
        {name: "text", value: text, filter: nonempty}
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
  render(index, {x, y}, channels, dimensions) {
    const {x: X, y: Y, rotate: R, text: T, fontSize: FS} = channels;
    const {width, height, marginTop, marginRight, marginBottom, marginLeft} = dimensions;
    const {rotate} = this;
    const cx = (marginLeft + width - marginRight) / 2;
    const cy = (marginTop + height - marginBottom) / 2;
    return create("svg:g")
        .call(applyIndirectTextStyles, this, T)
        .call(applyTransform, x, y, offset, offset)
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
            .call(applyText, T)
            .call(applyChannelStyles, this, channels))
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

function applyIndirectTextStyles(selection, mark, T) {
  applyIndirectStyles(selection, mark);
  applyAttr(selection, "text-anchor", mark.textAnchor);
  applyAttr(selection, "font-family", mark.fontFamily);
  applyAttr(selection, "font-size", mark.fontSize);
  applyAttr(selection, "font-style", mark.fontStyle);
  applyAttr(selection, "font-variant", mark.fontVariant === undefined && (isNumeric(T) || isTemporal(T)) ? "tabular-nums" : mark.fontVariant);
  applyAttr(selection, "font-weight", mark.fontWeight);
}

function applyDirectTextStyles(selection, mark) {
  applyDirectStyles(selection, mark);
  applyAttr(selection, "dx", mark.dx);
  applyAttr(selection, "dy", mark.dy);
}
