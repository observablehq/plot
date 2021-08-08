import {string, number, maybeColor, maybeNumber, title, titleGroup} from "./mark.js";

export const offset = typeof window !== "undefined" && window.devicePixelRatio > 1 ? 0 : 0.5;

export function styles(
  mark,
  {
    title,
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
    shapeRendering
  },
  channels,
  {
    fill: defaultFill = "currentColor",
    stroke: defaultStroke = "none",
    strokeWidth: defaultStrokeWidth,
    strokeMiterlimit: defaultStrokeMiterlimit
  }
) {
  const [vstroke, cstroke] = maybeColor(stroke, defaultStroke);
  if (cstroke !== "none") {
    if (defaultFill === "currentColor") defaultFill = "none";
    if (strokeWidth === undefined) strokeWidth = defaultStrokeWidth;
    if (strokeMiterlimit === undefined) strokeMiterlimit = defaultStrokeMiterlimit;
  }
  const [vfill, cfill] = maybeColor(fill, defaultFill);
  const [vfillOpacity, cfillOpacity] = maybeNumber(fillOpacity);
  const [vstrokeOpacity, cstrokeOpacity] = maybeNumber(strokeOpacity);
  mark.fill = impliedString(cfill, "currentColor");
  mark.fillOpacity = impliedNumber(cfillOpacity, 1);
  mark.stroke = impliedString(cstroke, "none");
  mark.strokeWidth = impliedNumber(strokeWidth, 1);
  mark.strokeOpacity = impliedNumber(cstrokeOpacity, 1);
  mark.strokeLinejoin = impliedString(strokeLinejoin, "miter");
  mark.strokeLinecap = impliedString(strokeLinecap, "butt");
  mark.strokeMiterlimit = impliedNumber(strokeMiterlimit, 4);
  mark.strokeDasharray = string(strokeDasharray);
  mark.mixBlendMode = impliedString(mixBlendMode, "normal");
  mark.shapeRendering = impliedString(shapeRendering, "auto");
  return [
    ...channels,
    {name: "title", value: title, optional: true},
    {name: "fill", value: vfill, scale: "color", optional: true},
    {name: "fillOpacity", value: vfillOpacity, scale: "opacity", optional: true},
    {name: "stroke", value: vstroke, scale: "color", optional: true},
    {name: "strokeOpacity", value: vstrokeOpacity, scale: "opacity", optional: true}
  ];
}

// TODO remove me
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
  shapeRendering
} = {}) {
  mark.fill = impliedString(fill, "currentColor");
  mark.fillOpacity = impliedNumber(fillOpacity, 1);
  mark.stroke = impliedString(stroke, "none");
  mark.strokeWidth = impliedNumber(strokeWidth, 1);
  mark.strokeOpacity = impliedNumber(strokeOpacity, 1);
  mark.strokeLinejoin = impliedString(strokeLinejoin, "miter");
  mark.strokeLinecap = impliedString(strokeLinecap, "butt");
  mark.strokeMiterlimit = impliedNumber(strokeMiterlimit, 4);
  mark.strokeDasharray = string(strokeDasharray);
  mark.mixBlendMode = impliedString(mixBlendMode, "normal");
  mark.shapeRendering = impliedString(shapeRendering, "auto");
}

export function applyChannelStyles(selection, {title: L, fill: F, fillOpacity: FO, stroke: S, strokeOpacity: SO}) {
  applyAttr(selection, "fill", F && (i => F[i]));
  applyAttr(selection, "fill-opacity", FO && (i => FO[i]));
  applyAttr(selection, "stroke", S && (i => S[i]));
  applyAttr(selection, "stroke-opacity", SO && (i => SO[i]));
  title(L)(selection);
}

export function applyGroupedChannelStyles(selection, {title: L, fill: F, fillOpacity: FO, stroke: S, strokeOpacity: SO}) {
  applyAttr(selection, "fill", F && (([i]) => F[i]));
  applyAttr(selection, "fill-opacity", FO && (([i]) => FO[i]));
  applyAttr(selection, "stroke", S && (([i]) => S[i]));
  applyAttr(selection, "stroke-opacity", SO && (([i]) => SO[i]));
  titleGroup(L)(selection);
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
  applyAttr(selection, "shape-rendering", mark.shapeRendering);
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

export function applyTransform(selection, x, y, tx, ty) {
  tx = tx ? offset : 0;
  ty = ty ? offset : 0;
  if (x && x.bandwidth) tx += x.bandwidth() / 2;
  if (y && y.bandwidth) ty += y.bandwidth() / 2;
  if (tx || ty) selection.attr("transform", `translate(${tx},${ty})`);
}

export function impliedString(value, impliedValue) {
  if ((value = string(value)) !== impliedValue) return value;
}

export function impliedNumber(value, impliedValue) {
  if ((value = number(value)) !== impliedValue) return value;
}
