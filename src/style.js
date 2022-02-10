import {isoFormat, namespaces} from "d3";
import {nonempty} from "./defined.js";
import {formatNumber} from "./format.js";
import {string, number, maybeColorChannel, maybeNumberChannel, isTemporal, isNumeric} from "./options.js";

export const offset = typeof window !== "undefined" && window.devicePixelRatio > 1 ? 0 : 0.5;

let nextClipId = 0;

export function styles(
  mark,
  {
    title,
    href,
    ariaLabel: variaLabel,
    ariaDescription,
    ariaHidden,
    target,
    fill,
    fillOpacity,
    stroke,
    strokeWidth,
    strokeOpacity,
    strokeLinejoin,
    strokeLinecap,
    strokeMiterlimit,
    strokeDasharray,
    strokeDashoffset,
    opacity,
    mixBlendMode,
    paintOrder,
    shapeRendering
  },
  channels,
  {
    ariaLabel: cariaLabel,
    fill: defaultFill = "currentColor",
    fillOpacity: defaultFillOpacity,
    stroke: defaultStroke = "none",
    strokeOpacity: defaultStrokeOpacity,
    strokeWidth: defaultStrokeWidth,
    strokeLinecap: defaultStrokeLinecap,
    strokeLinejoin: defaultStrokeLinejoin,
    strokeMiterlimit: defaultStrokeMiterlimit,
    paintOrder: defaultPaintOrder
  }
) {

  // Some marks don’t support fill (e.g., tick and rule).
  if (defaultFill === null) {
    fill = null;
    fillOpacity = null;
  }

  // Some marks don’t support stroke (e.g., image).
  if (defaultStroke === null) {
    stroke = null;
    strokeOpacity = null;
  }

  // Some marks default to fill with no stroke, while others default to stroke
  // with no fill. For example, bar and area default to fill, while dot and line
  // default to stroke. For marks that fill by default, the default fill only
  // applies if the stroke is (constant) none; if you set a stroke, then the
  // default fill becomes none. Similarly for marks that stroke by stroke, the
  // default stroke only applies if the fill is (constant) none.
  if (none(defaultFill)) {
    if (!none(defaultStroke) && !none(fill)) defaultStroke = "none";
  } else {
    if (none(defaultStroke) && !none(stroke)) defaultFill = "none";
  }

  const [vfill, cfill] = maybeColorChannel(fill, defaultFill);
  const [vfillOpacity, cfillOpacity] = maybeNumberChannel(fillOpacity, defaultFillOpacity);
  const [vstroke, cstroke] = maybeColorChannel(stroke, defaultStroke);
  const [vstrokeOpacity, cstrokeOpacity] = maybeNumberChannel(strokeOpacity, defaultStrokeOpacity);
  const [vopacity, copacity] = maybeNumberChannel(opacity);

  // For styles that have no effect if there is no stroke, only apply the
  // defaults if the stroke is not the constant none. (If stroke is a channel,
  // then cstroke will be undefined, but there’s still a stroke; hence we don’t
  // use the none helper here.)
  if (cstroke !== "none") {
    if (strokeWidth === undefined) strokeWidth = defaultStrokeWidth;
    if (strokeLinecap === undefined) strokeLinecap = defaultStrokeLinecap;
    if (strokeLinejoin === undefined) strokeLinejoin = defaultStrokeLinejoin;
    if (strokeMiterlimit === undefined) strokeMiterlimit = defaultStrokeMiterlimit;

    // The paint order only takes effect if there is both a fill and a stroke
    // (at least if we ignore markers, which no built-in marks currently use).
    if (cfill !== "none" && paintOrder === undefined) paintOrder = defaultPaintOrder;
  }

  const [vstrokeWidth, cstrokeWidth] = maybeNumberChannel(strokeWidth);

  // Some marks don’t support fill (e.g., tick and rule).
  if (defaultFill !== null) {
    mark.fill = impliedString(cfill, "currentColor");
    mark.fillOpacity = impliedNumber(cfillOpacity, 1);
  }

  // Some marks don’t support stroke (e.g., image).
  if (defaultStroke !== null) {
    mark.stroke = impliedString(cstroke, "none");
    mark.strokeWidth = impliedNumber(cstrokeWidth, 1);
    mark.strokeOpacity = impliedNumber(cstrokeOpacity, 1);
    mark.strokeLinejoin = impliedString(strokeLinejoin, "miter");
    mark.strokeLinecap = impliedString(strokeLinecap, "butt");
    mark.strokeMiterlimit = impliedNumber(strokeMiterlimit, 4);
    mark.strokeDasharray = impliedString(strokeDasharray, "none");
    mark.strokeDashoffset = impliedString(strokeDashoffset, "0");
  }

  mark.target = string(target);
  mark.ariaLabel = string(cariaLabel);
  mark.ariaDescription = string(ariaDescription);
  mark.ariaHidden = string(ariaHidden);
  mark.opacity = impliedNumber(copacity, 1);
  mark.mixBlendMode = impliedString(mixBlendMode, "normal");
  mark.paintOrder = impliedString(paintOrder, "normal");
  mark.shapeRendering = impliedString(shapeRendering, "auto");

  return [
    ...channels,
    {name: "title", value: title, optional: true},
    {name: "href", value: href, optional: true},
    {name: "ariaLabel", value: variaLabel, optional: true},
    {name: "fill", value: vfill, scale: "color", optional: true},
    {name: "fillOpacity", value: vfillOpacity, scale: "opacity", optional: true},
    {name: "stroke", value: vstroke, scale: "color", optional: true},
    {name: "strokeOpacity", value: vstrokeOpacity, scale: "opacity", optional: true},
    {name: "strokeWidth", value: vstrokeWidth, optional: true},
    {name: "opacity", value: vopacity, scale: "opacity", optional: true}
  ];
}

// Applies the specified titles via selection.call.
export function applyTitle(selection, L) {
  if (L) selection.filter(i => nonempty(L[i])).append("title").call(applyText, L);
}

// Like applyTitle, but for grouped data (lines, areas).
export function applyTitleGroup(selection, L) {
  if (L) selection.filter(([i]) => nonempty(L[i])).append("title").call(applyTextGroup, L);
}

export function applyText(selection, T) {
  if (T) selection.text(isTemporal(T) ? i => isoFormat(T[i]) : isNumeric(T) ? (f => i => f(T[i]))(formatNumber()) : i => T[i]);
}

export function applyTextGroup(selection, T) {
  if (T) selection.text(isTemporal(T) ? ([i]) => isoFormat(T[i]) : isNumeric(T) ? (f => ([i]) => f(T[i]))(formatNumber()) : ([i]) => T[i]);
}

export function applyChannelStyles(selection, {target}, {ariaLabel: AL, title: T, fill: F, fillOpacity: FO, stroke: S, strokeOpacity: SO, strokeWidth: SW, opacity: O, href: H}) {
  if (AL) applyAttr(selection, "aria-label", i => AL[i]);
  if (F) applyAttr(selection, "fill", i => F[i]);
  if (FO) applyAttr(selection, "fill-opacity", i => FO[i]);
  if (S) applyAttr(selection, "stroke", i => S[i]);
  if (SO) applyAttr(selection, "stroke-opacity", i => SO[i]);
  if (SW) applyAttr(selection, "stroke-width", i => SW[i]);
  if (O) applyAttr(selection, "opacity", i => O[i]);
  if (H) applyHref(selection, i => H[i], target);
  applyTitle(selection, T);
}

export function applyGroupedChannelStyles(selection, {target}, {ariaLabel: AL, title: T, fill: F, fillOpacity: FO, stroke: S, strokeOpacity: SO, strokeWidth: SW, opacity: O, href: H}) {
  if (AL) applyAttr(selection, "aria-label", ([i]) => AL[i]);
  if (F) applyAttr(selection, "fill", ([i]) => F[i]);
  if (FO) applyAttr(selection, "fill-opacity", ([i]) => FO[i]);
  if (S) applyAttr(selection, "stroke", ([i]) => S[i]);
  if (SO) applyAttr(selection, "stroke-opacity", ([i]) => SO[i]);
  if (SW) applyAttr(selection, "stroke-width", ([i]) => SW[i]);
  if (O) applyAttr(selection, "opacity", ([i]) => O[i]);
  if (H) applyHref(selection, ([i]) => H[i], target);
  applyTitleGroup(selection, T);
}

// clip: true clips to the frame
// TODO: accept other types of clips (paths, urls, x, y, other marks?…)
// https://github.com/observablehq/plot/issues/181
export function maybeClip(clip) {
  if (clip === true) return "frame";
  if (clip == null || clip === false) return false;
  throw new Error(`clip method not implemented: ${clip}`);
}

export function applyIndirectStyles(selection, mark, {width, height, marginLeft, marginRight, marginTop, marginBottom}) {
  applyAttr(selection, "aria-label", mark.ariaLabel);
  applyAttr(selection, "aria-description", mark.ariaDescription);
  applyAttr(selection, "aria-hidden", mark.ariaHidden);
  applyAttr(selection, "fill", mark.fill);
  applyAttr(selection, "fill-opacity", mark.fillOpacity);
  applyAttr(selection, "stroke", mark.stroke);
  applyAttr(selection, "stroke-width", mark.strokeWidth);
  applyAttr(selection, "stroke-opacity", mark.strokeOpacity);
  applyAttr(selection, "stroke-linejoin", mark.strokeLinejoin);
  applyAttr(selection, "stroke-linecap", mark.strokeLinecap);
  applyAttr(selection, "stroke-miterlimit", mark.strokeMiterlimit);
  applyAttr(selection, "stroke-dasharray", mark.strokeDasharray);
  applyAttr(selection, "stroke-dashoffset", mark.strokeDashoffset);
  applyAttr(selection, "shape-rendering", mark.shapeRendering);
  applyAttr(selection, "paint-order", mark.paintOrder);
  if (mark.clip === "frame") {
    const id = `plot-clip-${++nextClipId}`;
    const w = width - marginRight - marginLeft;
    const h = height - marginTop - marginBottom;
    selection.append("clipPath").attr("id", id).append("rect").attr("width", w).attr("height", h);
    applyAttr(selection, "clip-path", `url(#${id})`);
  }
}

export function applyDirectStyles(selection, mark) {
  applyStyle(selection, "mix-blend-mode", mark.mixBlendMode);
  applyAttr(selection, "opacity", mark.opacity);
}

function applyHref(selection, href, target) {
  selection.each(function(i) {
    const h = href(i);
    if (h != null) {
      const a = document.createElementNS(namespaces.svg, "a");
      a.setAttributeNS(namespaces.xlink, "href", h);
      if (target != null) a.setAttribute("target", target);
      this.parentNode.insertBefore(a, this).appendChild(this);
    }
  });
}

export function applyAttr(selection, name, value) {
  if (value != null) selection.attr(name, value);
}

export function applyStyle(selection, name, value) {
  if (value != null) selection.style(name, value);
}

export function applyTransform(selection, x, y, tx, ty) {
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

export function none(color) {
  return color == null || /^\s*none\s*$/i.test(color);
}

const validClassName = /^-?([_a-z]|[\240-\377]|\\[0-9a-f]{1,6}(\r\n|[ \t\r\n\f])?|\\[^\r\n\f0-9a-f])([_a-z0-9-]|[\240-\377]|\\[0-9a-f]{1,6}(\r\n|[ \t\r\n\f])?|\\[^\r\n\f0-9a-f])*$/;

export function maybeClassName(name) {
  if (name === undefined) return `plot-${Math.random().toString(16).slice(2)}`;
  name = `${name}`;
  if (!validClassName.test(name)) throw new Error(`invalid class name: ${name}`);
  return name;
}

export function applyInlineStyles(selection, style) {
  if (typeof style === "string") {
    selection.property("style", style);
  } else if (style != null) {
    for (const element of selection) {
      Object.assign(element.style, style);
    }
  }
}

export function applyFrameAnchor({frameAnchor}, {width, height, marginTop, marginRight, marginBottom, marginLeft}) {
  return [
    /left$/.test(frameAnchor) ? marginLeft : /right$/.test(frameAnchor) ? width - marginRight : (marginLeft + width - marginRight) / 2,
    /^top/.test(frameAnchor) ? marginTop : /^bottom/.test(frameAnchor) ? height - marginBottom : (marginTop + height - marginBottom) / 2
  ];
}
