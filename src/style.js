import {geoPath, group, namespaces, select} from "d3";
import {create} from "./context.js";
import {defined, nonempty} from "./defined.js";
import {formatDefault} from "./format.js";
import {isNone, isNoneish, isRound, maybeColorChannel, maybeNumberChannel} from "./options.js";
import {keyof, number, string} from "./options.js";
import {warn} from "./warnings.js";

export const offset = (typeof window !== "undefined" ? window.devicePixelRatio > 1 : typeof it === "undefined") ? 0 : 0.5; // prettier-ignore

let nextClipId = 0;
let nextPatternId = 0;

export function getClipId() {
  return `plot-clip-${++nextClipId}`;
}

export function getPatternId() {
  return `plot-pattern-${++nextPatternId}`;
}

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
    imageFilter,
    paintOrder,
    pointerEvents,
    shapeRendering,
    channels
  },
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
  if (isNoneish(defaultFill)) {
    if (!isNoneish(defaultStroke) && (!isNoneish(fill) || channels?.fill)) defaultStroke = "none";
  } else {
    if (isNoneish(defaultStroke) && (!isNoneish(stroke) || channels?.stroke)) defaultFill = "none";
  }

  const [vfill, cfill] = maybeColorChannel(fill, defaultFill);
  const [vfillOpacity, cfillOpacity] = maybeNumberChannel(fillOpacity, defaultFillOpacity);
  const [vstroke, cstroke] = maybeColorChannel(stroke, defaultStroke);
  const [vstrokeOpacity, cstrokeOpacity] = maybeNumberChannel(strokeOpacity, defaultStrokeOpacity);
  const [vopacity, copacity] = maybeNumberChannel(opacity);

  // For styles that have no effect if there is no stroke, only apply the
  // defaults if the stroke is not the constant none. (If stroke is a channel,
  // then cstroke will be undefined, but there’s still a stroke; hence we don’t
  // use isNoneish here.)
  if (!isNone(cstroke)) {
    if (strokeWidth === undefined) strokeWidth = defaultStrokeWidth;
    if (strokeLinecap === undefined) strokeLinecap = defaultStrokeLinecap;
    if (strokeLinejoin === undefined) strokeLinejoin = defaultStrokeLinejoin;

    // The default stroke miterlimit need not be applied if the current stroke
    // is the constant round; this only has effect on miter joins.
    if (strokeMiterlimit === undefined && !isRound(strokeLinejoin)) strokeMiterlimit = defaultStrokeMiterlimit;

    // The paint order only takes effect if there is both a fill and a stroke
    // (at least if we ignore markers, which no built-in marks currently use).
    if (!isNone(cfill) && paintOrder === undefined) paintOrder = defaultPaintOrder;
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
  mark.imageFilter = impliedString(imageFilter, "none");
  mark.paintOrder = impliedString(paintOrder, "normal");
  mark.pointerEvents = impliedString(pointerEvents, "auto");
  mark.shapeRendering = impliedString(shapeRendering, "auto");

  return {
    title: {value: title, optional: true, filter: null},
    href: {value: href, optional: true, filter: null},
    ariaLabel: {value: variaLabel, optional: true, filter: null},
    fill: {value: vfill, scale: "auto", optional: true},
    fillOpacity: {value: vfillOpacity, scale: "auto", optional: true},
    stroke: {value: vstroke, scale: "auto", optional: true},
    strokeOpacity: {value: vstrokeOpacity, scale: "auto", optional: true},
    strokeWidth: {value: vstrokeWidth, optional: true},
    opacity: {value: vopacity, scale: "auto", optional: true}
  };
}

// Applies the specified titles via selection.call.
export function applyTitle(selection, L) {
  if (L)
    selection
      .filter((i) => nonempty(L[i]))
      .append("title")
      .call(applyText, L);
}

// Like applyTitle, but for grouped data (lines, areas).
export function applyTitleGroup(selection, L) {
  if (L)
    selection
      .filter(([i]) => nonempty(L[i]))
      .append("title")
      .call(applyTextGroup, L);
}

export function applyText(selection, T) {
  if (T) selection.text((i) => formatDefault(T[i]));
}

export function applyTextGroup(selection, T) {
  if (T) selection.text(([i]) => formatDefault(T[i]));
}

export function applyChannelStyles(
  selection,
  {target, tip},
  {
    ariaLabel: AL,
    title: T,
    fill: F,
    fillOpacity: FO,
    stroke: S,
    strokeOpacity: SO,
    strokeWidth: SW,
    opacity: O,
    href: H
  }
) {
  if (AL) applyAttr(selection, "aria-label", (i) => AL[i]);
  if (F) applyAttr(selection, "fill", (i) => F[i]);
  if (FO) applyAttr(selection, "fill-opacity", (i) => FO[i]);
  if (S) applyAttr(selection, "stroke", (i) => S[i]);
  if (SO) applyAttr(selection, "stroke-opacity", (i) => SO[i]);
  if (SW) applyAttr(selection, "stroke-width", (i) => SW[i]);
  if (O) applyAttr(selection, "opacity", (i) => O[i]);
  if (H) applyHref(selection, (i) => H[i], target);
  if (!tip) applyTitle(selection, T);
}

export function applyGroupedChannelStyles(
  selection,
  {target, tip},
  {
    ariaLabel: AL,
    title: T,
    fill: F,
    fillOpacity: FO,
    stroke: S,
    strokeOpacity: SO,
    strokeWidth: SW,
    opacity: O,
    href: H
  }
) {
  if (AL) applyAttr(selection, "aria-label", ([i]) => AL[i]);
  if (F) applyAttr(selection, "fill", ([i]) => F[i]);
  if (FO) applyAttr(selection, "fill-opacity", ([i]) => FO[i]);
  if (S) applyAttr(selection, "stroke", ([i]) => S[i]);
  if (SO) applyAttr(selection, "stroke-opacity", ([i]) => SO[i]);
  if (SW) applyAttr(selection, "stroke-width", ([i]) => SW[i]);
  if (O) applyAttr(selection, "opacity", ([i]) => O[i]);
  if (H) applyHref(selection, ([i]) => H[i], target);
  if (!tip) applyTitleGroup(selection, T);
}

function groupAesthetics(
  {
    ariaLabel: AL,
    title: T,
    fill: F,
    fillOpacity: FO,
    stroke: S,
    strokeOpacity: SO,
    strokeWidth: SW,
    opacity: O,
    href: H
  },
  {tip}
) {
  return [AL, tip ? undefined : T, F, FO, S, SO, SW, O, H].filter((c) => c !== undefined);
}

export function groupZ(I, Z, z) {
  const G = group(I, (i) => Z[i]);
  if (z === undefined && G.size > (1 + I.length) >> 1) {
    warn(
      `Warning: the implicit z channel has high cardinality. This may occur when the fill or stroke channel is associated with quantitative data rather than ordinal or categorical data. You can suppress this warning by setting the z option explicitly; if this data represents a single series, set z to null.`
    );
  }
  return G.values();
}

export function* groupIndex(I, position, mark, channels) {
  const {z} = mark;
  const {z: Z} = channels; // group channel
  const A = groupAesthetics(channels, mark); // aesthetic channels
  const C = [...position, ...A]; // all channels

  // Group the current index by Z (if any).
  for (const G of Z ? groupZ(I, Z, z) : [I]) {
    let Ag; // the A-values (aesthetics) of the current group, if any
    let Gg; // the current group index (a subset of G, and I), if any
    out: for (const i of G) {
      // If any channel has an undefined value for this index, skip it.
      for (const c of C) {
        if (!defined(c[i])) {
          if (Gg) Gg.push(-1);
          continue out;
        }
      }

      // Otherwise, if this is a new group, record the aesthetics for this
      // group. Yield the current group and start a new one.
      if (Ag === undefined) {
        if (Gg) yield Gg;
        (Ag = A.map((c) => keyof(c[i]))), (Gg = [i]);
        continue;
      }

      // Otherwise, add the current index to the current group. Then, if any of
      // the aesthetics don’t match the current group, yield the current group
      // and start a new group of the current index.
      Gg.push(i);
      for (let j = 0; j < A.length; ++j) {
        const k = keyof(A[j][i]);
        if (k !== Ag[j]) {
          yield Gg;
          (Ag = A.map((c) => keyof(c[i]))), (Gg = [i]);
          continue out;
        }
      }
    }

    // Yield the current group, if any.
    if (Gg) yield Gg;
  }
}

// Note: may mutate selection.node!
function applyClip(selection, mark, dimensions, context) {
  let clipUrl;
  const {clip = context.clip} = mark;
  switch (clip) {
    case "frame": {
      // Wrap the G element with another (untransformed) G element, applying the
      // clip to the parent G element so that the clip path is not affected by
      // the mark’s transform. To simplify the adoption of this fix, mutate the
      // passed-in selection.node to return the parent G element.
      selection = create("svg:g", context).each(function () {
        this.appendChild(selection.node());
        selection.node = () => this; // Note: mutation!
      });
      clipUrl = getFrameClip(context, dimensions);
      break;
    }
    case "sphere": {
      clipUrl = getProjectionClip(context);
      break;
    }
  }
  // Here we’re careful to apply the ARIA attributes to the outer G element when
  // clipping is applied, and to apply the ARIA attributes before any other
  // attributes (for readability).
  applyAttr(selection, "aria-label", mark.ariaLabel);
  applyAttr(selection, "aria-description", mark.ariaDescription);
  applyAttr(selection, "aria-hidden", mark.ariaHidden);
  applyAttr(selection, "clip-path", clipUrl);
}

function memoizeClip(clip) {
  const cache = new WeakMap();
  return (context, dimensions) => {
    let url = cache.get(context);
    if (!url) {
      const id = getClipId();
      select(context.ownerSVGElement).append("clipPath").attr("id", id).call(clip, context, dimensions);
      cache.set(context, (url = `url(#${id})`));
    }
    return url;
  };
}

const getFrameClip = memoizeClip((clipPath, context, dimensions) => {
  const {width, height, marginLeft, marginRight, marginTop, marginBottom} = dimensions;
  clipPath
    .append("rect")
    .attr("x", marginLeft)
    .attr("y", marginTop)
    .attr("width", width - marginRight - marginLeft)
    .attr("height", height - marginTop - marginBottom);
});

const getProjectionClip = memoizeClip((clipPath, context) => {
  const {projection} = context;
  if (!projection) throw new Error(`the "sphere" clip option requires a projection`);
  clipPath.append("path").attr("d", geoPath(projection)({type: "Sphere"}));
});

// Note: may mutate selection.node!
export function applyIndirectStyles(selection, mark, dimensions, context) {
  applyClip(selection, mark, dimensions, context);
  applyAttr(selection, "class", mark.className);
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
  applyAttr(selection, "filter", mark.imageFilter);
  applyAttr(selection, "paint-order", mark.paintOrder);
  const {pointerEvents = context.pointerSticky === false ? "none" : undefined} = mark;
  applyAttr(selection, "pointer-events", pointerEvents);
}

export function applyDirectStyles(selection, mark) {
  applyStyle(selection, "mix-blend-mode", mark.mixBlendMode);
  applyAttr(selection, "opacity", mark.opacity);
}

function applyHref(selection, href, target) {
  selection.each(function (i) {
    const h = href(i);
    if (h != null) {
      const a = this.ownerDocument.createElementNS(namespaces.svg, "a");
      a.setAttribute("fill", "inherit");
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

export function applyTransform(selection, mark, {x, y}, tx = offset, ty = offset) {
  tx += mark.dx;
  ty += mark.dy;
  if (x?.bandwidth) tx += x.bandwidth() / 2;
  if (y?.bandwidth) ty += y.bandwidth() / 2;
  if (tx || ty) selection.attr("transform", `translate(${tx},${ty})`);
}

export function impliedString(value, impliedValue) {
  if ((value = string(value)) !== impliedValue) return value;
}

export function impliedNumber(value, impliedValue) {
  if ((value = number(value)) !== impliedValue) return value;
}

// https://www.w3.org/TR/CSS21/grammar.html
const validClassName =
  /^-?([_a-z]|[\240-\377]|\\[0-9a-f]{1,6}(\r\n|[ \t\r\n\f])?|\\[^\r\n\f0-9a-f])([_a-z0-9-]|[\240-\377]|\\[0-9a-f]{1,6}(\r\n|[ \t\r\n\f])?|\\[^\r\n\f0-9a-f])*$/i;

export function maybeClassName(name) {
  // The default should be changed whenever the default styles are changed, so
  // as to avoid conflict when multiple versions of Plot are on the page.
  if (name === undefined) return "plot-d6a7b5";
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
    /left$/.test(frameAnchor)
      ? marginLeft
      : /right$/.test(frameAnchor)
      ? width - marginRight
      : (marginLeft + width - marginRight) / 2,
    /^top/.test(frameAnchor)
      ? marginTop
      : /^bottom/.test(frameAnchor)
      ? height - marginBottom
      : (marginTop + height - marginBottom) / 2
  ];
}
