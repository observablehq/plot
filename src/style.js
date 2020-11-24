import {string, number} from "./mark.js";

export function Style({
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
  return {
    fill: string(fill),
    fillOpacity: number(fillOpacity),
    stroke: string(stroke),
    strokeWidth: number(strokeWidth),
    strokeOpacity: number(strokeOpacity),
    strokeLinejoin: string(strokeLinejoin),
    strokeLinecap: string(strokeLinecap),
    strokeMiterlimit: number(strokeMiterlimit),
    strokeDasharray: string(strokeDasharray),
    mixBlendMode: string(mixBlendMode)
  };
}

export function applyStyles(selection, style) {
  applyIndirectStyles(selection, style);
  applyDirectStyles(selection, style);
}

export function applyIndirectStyles(selection, style) {
  applyAttr(selection, "fill", style.fill);
  applyAttr(selection, "fill-opacity", style.fillOpacity);
  applyAttr(selection, "stroke", style.stroke);
  applyAttr(selection, "stroke-width", style.strokeWidth);
  applyAttr(selection, "stroke-opacity", style.strokeOpacity);
  applyAttr(selection, "stroke-linejoin", style.strokeLinejoin);
  applyAttr(selection, "stroke-linecap", style.strokeLinecap);
  applyAttr(selection, "stroke-miterlimit", style.strokeMiterlimit);
  applyAttr(selection, "stroke-dasharray", style.strokeDasharray);
}

export function applyDirectStyles(selection, style) {
  applyStyle(selection, "mix-blend-mode", style.mixBlendMode);
}

function applyAttr(selection, name, value) {
  if (value != null) selection.attr(name, value);
}

function applyStyle(selection, name, value) {
  if (value != null) selection.style(name, value);
}
