import {string, number} from "./mark.js";

export function Style(mark, {
  fill,
  fillOpacity,
  stroke,
  strokeWidth,
  strokeOpacity,
  strokeLinejoin,
  strokeLinecap,
  strokeMiterlimit,
  strokeDasharray,
  mixBlendMode,
  fontFamily,
  fontSize,
  fontSizeAdjust,
  fontStretch,
  fontStyle,
  fontVariant,
  fontWeight
} = {}) {
  mark.fill = impliedString(fill, "currentColor");
  mark.fillOpacity = impliedNumber(fillOpacity, 1);
  mark.stroke = impliedString(stroke, "none");
  mark.strokeWidth = impliedNumber(strokeWidth, 1);
  mark.strokeOpacity = impliedNumber(strokeOpacity, 1);
  mark.strokeLinejoin = impliedString(strokeLinejoin, "miter");
  mark.strokeLinecap = impliedString(strokeLinecap, "butt");
  mark.strokeMiterlimit = impliedNumber(strokeMiterlimit, 1);
  mark.strokeDasharray = string(strokeDasharray);
  mark.mixBlendMode = impliedString(mixBlendMode, "normal");
  
  mark.font = {
    family: impliedString(fontFamily, "sans-serif"),
    size: impliedString(fontSize, "10px"),
    sizeAdjust: impliedString(fontSizeAdjust, "none"),
    stretch: impliedString(fontStretch, "normal"),
    style: impliedString(fontStyle, "normal"),
    variant: impliedString(fontVariant, "normal"),
    weight: impliedString(fontWeight, "normal")
  };
}

export function applyIndirectStyles(selection, mark) {
  applyAttr(selection, "fill", mark.fill);
  applyAttr(selection, "fill-opacity", mark.fillOpacity);
  applyAttr(selection, "stroke", mark.stroke);
  applyAttr(selection, "stroke-width", mark.strokeWidth);
  applyAttr(selection, "stroke-opacity", mark.strokeOpacity);
  applyAttr(selection, "stroke-linejoin", mark.strokeLinejoin);
  applyAttr(selection, "stroke-linecap", mark.strokeLinecap);
  applyAttr(selection, "stroke-miterlimit", mark.strokeMiterlimit);
  applyAttr(selection, "stroke-dasharray", mark.strokeDasharray);
  applyAttr(selection, "font-family", mark.font.family);
  applyAttr(selection, "font-size", mark.font.size);
  applyAttr(selection, "font-size-adjust", mark.font.sizeAdjust);
  applyAttr(selection, "font-stretch", mark.font.stretch);
  applyAttr(selection, "font-style", mark.font.style);
  applyAttr(selection, "font-variant", mark.font.variant);
  applyAttr(selection, "font-weight", mark.font.weight);
}

export function applyDirectStyles(selection, mark) {
  applyStyle(selection, "mix-blend-mode", mark.mixBlendMode);
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
