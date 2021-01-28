import {string, number} from "./mark.js";

const stylesList = [
  ["fill", "fill", "currentColor", impliedString],
  ["fillOpacity", "fill-opacity", 1, impliedNumber],
  ["stroke", "stroke", "none", impliedString],
  ["strokeWidth", "stroke-width", 1, impliedNumber],
  ["strokeOpacity", "stroke-opacity", 1, impliedNumber],
  ["strokeLinejoin", "stroke-linejoin", "miter", impliedString],
  ["strokeLinecap", "stroke-linecap", "butt", impliedString],
  ["strokeMiterlimit", "stroke-miterlimit", 1, impliedNumber],
  ["strokeDasharray", "stroke-dasharray", null, string],
  ["mixBlendMode", "mix-blend-mode", "normal", impliedString, true],
  ["fontFamily", "font-family", "sans-serif", impliedString],
  ["fontSize", "font-size", "10px", impliedString],
  ["fontSizeAdjust", "font-size-adjust", "none", impliedString],
  ["fontStretch", "font-stretch", "normal", impliedString],
  ["fontStyle", "font-style", "normal", impliedString],
  ["fontVariant", "font-variant", "normal", impliedString],
  ["fontWeight", "font-weight", "normal", impliedString]
];

export function Style(mark, styles = {}) {
  for (const [key, hyphenkey, value, type] of stylesList) {
    mark[key] = type((hyphenkey in styles) ? styles[hyphenkey] : styles[key], value);
  }
}

export function applyIndirectStyles(selection, mark) {
  for (const [key, hyphenkey,,, indirect] of stylesList) {
    if (!indirect) applyAttr(selection, hyphenkey, mark[key]);
  }
}

export function applyDirectStyles(selection, mark) {
  for (const [key, hyphenkey,,, indirect] of stylesList) {
    if (indirect) applyStyle(selection, hyphenkey, mark[key]);
  }
}

export function applyAttr(selection, name, value) {
  if (value != null) selection.attr(name, value);
}

export function applyStyle(selection, name, value) {
  if (value != null) selection.style(name, value);
}

export function applyTransform(selection, x, y, tx = 0, ty = 0) {
  if (x.bandwidth) tx += x.bandwidth() / 2;
  if (y.bandwidth) ty += y.bandwidth() / 2;
  selection.attr("transform", `translate(${tx},${ty})`);
}

function impliedString(value, impliedValue) {
  if ((value = string(value)) !== impliedValue) return value;
}

function impliedNumber(value, impliedValue) {
  if ((value = number(value)) !== impliedValue) return value;
}
