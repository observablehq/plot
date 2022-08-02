import type {
  ChannelStyles,
  DefaultOptions,
  Dimensions,
  InstantiatedMark,
  MarkOptions,
  Scales,
  Selection
} from "./api.js";
import type {Datum, index, Series, Value, ValueArray} from "./data.js";
import type {Accessor} from "./options.js";

import {group, namespaces} from "d3";
import {defined, nonempty} from "./defined.js";
import {formatDefault} from "./format.js";
import {string, number, maybeColorChannel, maybeNumberChannel, isNoneish, isNone, isRound, keyof} from "./options.js";
import {warn} from "./warnings.js";

export const offset = typeof window !== "undefined" && window.devicePixelRatio > 1 ? 0 : 0.5;

let nextClipId = 0;

export function styles<T extends Datum>(
  mark: InstantiatedMark<T>,
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
    pointerEvents,
    shapeRendering
  }: MarkOptions<T>,
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
  }: DefaultOptions
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
    if (!isNoneish(defaultStroke) && !isNoneish(fill)) defaultStroke = "none";
  } else {
    if (isNoneish(defaultStroke) && !isNoneish(stroke)) defaultFill = "none";
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
  mark.ariaHidden = string(ariaHidden) as "true" | "false" | undefined;
  mark.opacity = impliedNumber(copacity, 1);
  mark.mixBlendMode = impliedString(mixBlendMode, "normal");
  mark.paintOrder = impliedString(paintOrder, "normal");
  mark.pointerEvents = impliedString(pointerEvents, "auto");
  mark.shapeRendering = impliedString(shapeRendering, "auto");

  return {
    title: {value: title, optional: true},
    href: {value: href, optional: true},
    ariaLabel: {value: variaLabel, optional: true},
    fill: {value: vfill, scale: "color", optional: true},
    fillOpacity: {value: vfillOpacity, scale: "opacity", optional: true},
    stroke: {value: vstroke, scale: "color", optional: true},
    strokeOpacity: {value: vstrokeOpacity, scale: "opacity", optional: true},
    strokeWidth: {value: vstrokeWidth, optional: true},
    opacity: {value: vopacity, scale: "opacity", optional: true}
  };
}

// Applies the specified titles via selection.call.
export function applyTitle(selection: Selection, L?: ValueArray) {
  if (L)
    selection
      .filter((i: index) => nonempty(L[i]))
      .append("title")
      .call(applyText, L);
}

// Like applyTitle, but for grouped data (lines, areas).
export function applyTitleGroup(selection: Selection, L?: ValueArray) {
  if (L)
    selection
      .filter(([i]: Series) => nonempty(L[i]))
      .append("title")
      .call(applyTextGroup, L);
}

export function applyText(selection: Selection, T?: ValueArray) {
  if (T) selection.text((i: index) => formatDefault(T[i]));
}

export function applyTextGroup(selection: Selection, T?: ValueArray) {
  if (T) selection.text(([i]: Series) => formatDefault(T[i]));
}

export function applyChannelStyles(
  selection: Selection,
  {target}: {target?: string},
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
  }: ChannelStyles
) {
  if (AL) applyAttr(selection, "aria-label", (i) => AL[i] as string);
  if (F) applyAttr(selection, "fill", (i) => F[i] as string);
  if (FO) applyAttr(selection, "fill-opacity", (i) => FO[i] as number);
  if (S) applyAttr(selection, "stroke", (i) => S[i] as string);
  if (SO) applyAttr(selection, "stroke-opacity", (i) => SO[i] as number);
  if (SW) applyAttr(selection, "stroke-width", (i) => SW[i] as number);
  if (O) applyAttr(selection, "opacity", (i) => O[i] as number);
  if (H) applyHref(selection, (i) => H[i] as string, target);
  applyTitle(selection, T);
}

export function applyGroupedChannelStyles(
  selection: Selection,
  {target}: {target?: string},
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
  }: ChannelStyles
) {
  if (AL) applyAttr(selection, "aria-label", ([i]: Series) => AL[i] as string);
  if (F) applyAttr(selection, "fill", ([i]: Series) => F[i] as string);
  if (FO) applyAttr(selection, "fill-opacity", ([i]: Series) => FO[i] as number);
  if (S) applyAttr(selection, "stroke", ([i]: Series) => S[i] as string);
  if (SO) applyAttr(selection, "stroke-opacity", ([i]: Series) => SO[i] as number);
  if (SW) applyAttr(selection, "stroke-width", ([i]: Series) => SW[i] as number);
  if (O) applyAttr(selection, "opacity", ([i]: Series) => O[i] as number);
  if (H) applyHref(selection, ([i]: Series) => H[i] as string, target);
  applyTitleGroup(selection, T);
}

function groupAesthetics({
  ariaLabel: AL,
  title: T,
  fill: F,
  fillOpacity: FO,
  stroke: S,
  strokeOpacity: SO,
  strokeWidth: SW,
  opacity: O,
  href: H
}: ChannelStyles) {
  return [AL, T, F, FO, S, SO, SW, O, H].filter((c) => c !== undefined) as ValueArray[];
}

export function groupZ<T extends Datum, U extends Value>(I: Series, Z: ValueArray, z: Accessor<T, U>) {
  const G = group(I, (i) => Z[i]);
  if (z === undefined && G.size > I.length >> 1) {
    warn(
      `Warning: the implicit z channel has high cardinality. This may occur when the fill or stroke channel is associated with quantitative data rather than ordinal or categorical data. You can suppress this warning by setting the z option explicitly; if this data represents a single series, set z to null.`
    );
  }
  return G.values();
}

export function* groupIndex<T extends Datum>(
  I: Series,
  position: ValueArray[],
  {z}: InstantiatedMark<T>,
  channels: ChannelStyles
) {
  const {z: Z} = channels; // group channel
  const A = groupAesthetics(channels); // aesthetic channels
  const C = [...position, ...A]; // all channels

  // Group the current index by Z (if any).
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  for (const G of Z ? groupZ(I, Z, z!) : [I]) {
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
      (Gg as index[]).push(i);
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

// clip: true clips to the frame
// TODO: accept other types of clips (paths, urls, x, y, other marks?…)
// https://github.com/observablehq/plot/issues/181
export function maybeClip(clip: boolean | null | undefined) {
  if (clip === true) return "frame";
  if (clip == null || clip === false) return false;
  throw new Error(`invalid clip method: ${clip}`);
}

export function applyIndirectStyles<T extends Datum>(
  selection: Selection,
  mark: InstantiatedMark<T>,
  scales: Scales,
  dimensions: Dimensions
) {
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
  applyAttr(selection, "pointer-events", mark.pointerEvents);
  if (mark.clip === "frame") {
    const {x, y} = scales;
    const {width, height, marginLeft, marginRight, marginTop, marginBottom} = dimensions;
    const id = `plot-clip-${++nextClipId}`;
    selection
      .attr("clip-path", `url(#${id})`)
      .append("clipPath")
      .attr("id", id)
      .append("rect")
      .attr("x", marginLeft - (x?.bandwidth ? x.bandwidth() / 2 : 0))
      .attr("y", marginTop - (y?.bandwidth ? y.bandwidth() / 2 : 0))
      .attr("width", width - marginRight - marginLeft)
      .attr("height", height - marginTop - marginBottom);
  }
}

export function applyDirectStyles<T extends Datum>(selection: Selection, mark: InstantiatedMark<T>) {
  applyStyle(selection, "mix-blend-mode", mark.mixBlendMode);
  applyAttr(selection, "opacity", mark.opacity);
}

function applyHref(selection: Selection, href: (i: index & Series) => string, target?: string) {
  selection.each(function (this: SVGElement, i) {
    const h = href(i);
    if (h != null) {
      const a = this.ownerDocument.createElementNS(namespaces.svg, "a");
      a.setAttribute("fill", "inherit");
      a.setAttributeNS(namespaces.xlink, "href", h);
      if (target != null) a.setAttribute("target", target);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.parentNode!.insertBefore(a, this).appendChild(this);
    }
  });
}

export function applyAttr(
  selection: Selection,
  name: string,
  value?: number | string | null | ((i: index & Series) => number | string)
) {
  if (value != null) selection.attr(name, value);
}

export function applyStyle(
  selection: Selection,
  name: string,
  value?: number | string | null | ((i: index & Series) => number | string)
) {
  if (value != null) selection.style(name, value);
}

export function applyTransform<T extends Datum>(
  selection: Selection,
  mark: InstantiatedMark<T>,
  {x, y}: Scales,
  tx = offset,
  ty = offset
) {
  tx += mark.dx;
  ty += mark.dy;
  if (x?.bandwidth) tx += x.bandwidth() / 2;
  if (y?.bandwidth) ty += y.bandwidth() / 2;
  if (tx || ty) selection.attr("transform", `translate(${tx},${ty})`);
}

export function impliedString(
  value: number | string | number[] | null | undefined,
  impliedValue: string
): string | null | undefined {
  if ((value = string(value)) !== impliedValue) return value as string | null | undefined;
}

export function impliedNumber(value: Datum, impliedValue: number): number | null | undefined {
  if ((value = number(value)) !== impliedValue) return value as number | null | undefined;
}

const validClassName =
  /^-?([_a-z]|[\240-\377]|\\[0-9a-f]{1,6}(\r\n|[ \t\r\n\f])?|\\[^\r\n\f0-9a-f])([_a-z0-9-]|[\240-\377]|\\[0-9a-f]{1,6}(\r\n|[ \t\r\n\f])?|\\[^\r\n\f0-9a-f])*$/;

export function maybeClassName(name: string | undefined) {
  if (name === undefined) return `plot-${Math.random().toString(16).slice(2)}`;
  name = `${name}`;
  if (!validClassName.test(name)) throw new Error(`invalid class name: ${name}`);
  return name;
}

export function applyInlineStyles(selection: Selection, style: string | CSSStyleDeclaration) {
  if (typeof style === "string") {
    selection.property("style", style);
  } else if (style != null) {
    for (const element of selection) {
      Object.assign(element.style, style);
    }
  }
}

export function applyFrameAnchor<T extends Datum>(
  {frameAnchor}: InstantiatedMark<T>,
  {width, height, marginTop, marginRight, marginBottom, marginLeft}: Dimensions
) {
  return [
    /left$/.test(frameAnchor as string)
      ? marginLeft
      : /right$/.test(frameAnchor as string)
      ? width - marginRight
      : (marginLeft + width - marginRight) / 2,
    /^top/.test(frameAnchor as string)
      ? marginTop
      : /^bottom/.test(frameAnchor as string)
      ? height - marginBottom
      : (marginTop + height - marginBottom) / 2
  ];
}
