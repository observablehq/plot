import {create, isoFormat, namespaces} from "d3";
import {nonempty} from "../defined.js";
import {formatNumber} from "../format.js";
import {indexOf, identity, string, maybeNumberChannel, maybeTuple, numberChannel, isNumeric, isTemporal, keyword} from "../options.js";
import {Mark} from "../plot.js";
import {applyChannelStyles, applyDirectStyles, applyIndirectStyles, applyAttr, applyTransform, offset, impliedString} from "../style.js";

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
      lineAnchor = "middle",
      lineHeight = 1,
      fontFamily,
      fontSize,
      fontStyle,
      fontVariant,
      fontWeight,
      rotate
    } = options;
    const [vrotate, crotate] = maybeNumberChannel(rotate, 0);
    const [vfontSize, cfontSize] = maybeFontSizeChannel(fontSize);
    super(
      data,
      [
        {name: "x", value: x, scale: "x", optional: true},
        {name: "y", value: y, scale: "y", optional: true},
        {name: "fontSize", value: vfontSize, optional: true},
        {name: "rotate", value: numberChannel(vrotate), optional: true},
        {name: "text", value: text, filter: nonempty}
      ],
      options,
      defaults
    );
    this.rotate = crotate;
    this.textAnchor = impliedString(textAnchor, "middle");
    this.lineAnchor = keyword(lineAnchor, "lineAnchor", ["top", "middle", "bottom"]);
    this.lineHeight = +lineHeight;
    this.fontFamily = string(fontFamily);
    this.fontSize = cfontSize;
    this.fontStyle = string(fontStyle);
    this.fontVariant = string(fontVariant);
    this.fontWeight = string(fontWeight);
  }
  render(index, {x, y}, channels, dimensions) {
    const {x: X, y: Y, rotate: R, text: T, fontSize: FS} = channels;
    const {width, height, marginTop, marginRight, marginBottom, marginLeft} = dimensions;
    const {dx, dy, rotate} = this;
    const cx = (marginLeft + width - marginRight) / 2;
    const cy = (marginTop + height - marginBottom) / 2;
    return create("svg:g")
        .call(applyIndirectTextStyles, this, T)
        .call(applyTransform, x, y, offset + dx, offset + dy)
        .call(g => g.selectAll()
          .data(index)
          .join("text")
            .call(applyDirectStyles, this)
            .call(applyMultilineText, this, T)
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
            .call(applyChannelStyles, this, channels))
      .node();
  }
}

function applyMultilineText(selection, {lineAnchor, lineHeight}, T) {
  if (!T) return;
  const format = isTemporal(T) ? isoFormat : isNumeric(T) ? formatNumber() : string;
  selection.each(function(i) {
    const lines = format(T[i]).split(/\r\n?|\n/g);
    const n = lines.length;
    const y = lineAnchor === "top" ? 0.71 : lineAnchor === "bottom" ? 1 - n : (164 - n * 100) / 200;
    if (n > 1) {
      for (let i = 0; i < n; ++i) {
        if (!lines[i]) continue;
        const tspan = document.createElementNS(namespaces.svg, "tspan");
        tspan.setAttribute("x", 0);
        tspan.setAttribute("y", `${(y + i) * lineHeight}em`);
        tspan.textContent = lines[i];
        this.appendChild(tspan);
      }
    } else {
      if (y) this.setAttribute("dy", `${y * lineHeight}em`);
      this.textContent = lines[0];
    }
  });
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

// https://developer.mozilla.org/en-US/docs/Web/CSS/font-size
const fontSizes = new Set([
  // global keywords
  "inherit",
  "initial",
  "revert",
  "unset",
  // absolute keywords
  "xx-small",
  "x-small",
  "small",
  "medium",
  "large",
  "x-large",
  "xx-large",
  "xxx-large",
  // relative keywords
  "larger",
  "smaller"
]);

// The font size may be expressed as a constant in the following forms:
// - number in pixels
// - string keyword: see above
// - string <length>: e.g., "12px"
// - string <percentage>: e.g., "80%"
// Anything else is assumed to be a channel definition.
function maybeFontSizeChannel(fontSize) {
  if (fontSize == null || typeof fontSize === "number") return [undefined, fontSize];
  if (typeof fontSize !== "string") return [fontSize, undefined];
  fontSize = fontSize.trim().toLowerCase();
  return fontSizes.has(fontSize) || /^[+-]?\d*\.?\d+(e[+-]?\d+)?(\w*|%)$/.test(fontSize)
    ? [undefined, fontSize]
    : [fontSize, undefined];
}
