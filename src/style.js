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
  mixBlendMode
} = {}) {
  mark.fill = string(fill);
  mark.fillOpacity = number(fillOpacity);
  mark.stroke = string(stroke);
  mark.strokeWidth = number(strokeWidth);
  mark.strokeOpacity = number(strokeOpacity);
  mark.strokeLinejoin = string(strokeLinejoin);
  mark.strokeLinecap = string(strokeLinecap);
  mark.strokeMiterlimit = number(strokeMiterlimit);
  mark.strokeDasharray = string(strokeDasharray);
  mark.mixBlendMode = string(mixBlendMode);
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
