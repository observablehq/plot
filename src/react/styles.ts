import type {Dimensions} from "./PlotContext.js";

// Converts the mark's "indirect" (group-level) styles into a props object
// for the outer <g> element, mirroring applyIndirectStyles from style.js.
export function indirectStyleProps(mark: Record<string, any>, _dimensions?: Dimensions): Record<string, any> {
  const props: Record<string, any> = {};
  if (mark.ariaLabel != null) props["aria-label"] = mark.ariaLabel;
  if (mark.ariaDescription != null) props["aria-description"] = mark.ariaDescription;
  if (mark.ariaHidden != null) props["aria-hidden"] = mark.ariaHidden;
  if (mark.className != null) props.className = mark.className;
  if (mark.fill != null) props.fill = mark.fill;
  if (mark.fillOpacity != null) props.fillOpacity = mark.fillOpacity;
  if (mark.stroke != null) props.stroke = mark.stroke;
  if (mark.strokeWidth != null) props.strokeWidth = mark.strokeWidth;
  if (mark.strokeOpacity != null) props.strokeOpacity = mark.strokeOpacity;
  if (mark.strokeLinejoin != null) props.strokeLinejoin = mark.strokeLinejoin;
  if (mark.strokeLinecap != null) props.strokeLinecap = mark.strokeLinecap;
  if (mark.strokeMiterlimit != null) props.strokeMiterlimit = mark.strokeMiterlimit;
  if (mark.strokeDasharray != null) props.strokeDasharray = mark.strokeDasharray;
  if (mark.strokeDashoffset != null) props.strokeDashoffset = mark.strokeDashoffset;
  if (mark.shapeRendering != null) props.shapeRendering = mark.shapeRendering;
  if (mark.imageFilter != null) props.filter = mark.imageFilter;
  if (mark.paintOrder != null) props.paintOrder = mark.paintOrder;
  if (mark.pointerEvents != null) props.pointerEvents = mark.pointerEvents;
  if (mark.clipPath != null) props.clipPath = mark.clipPath;
  return props;
}

// Converts direct styles (applied to individual elements) to a props object,
// mirroring applyDirectStyles from style.js.
export function directStyleProps(mark: Record<string, any>): Record<string, any> {
  const props: Record<string, any> = {};
  if (mark.mixBlendMode != null && mark.mixBlendMode !== "normal") {
    props.style = {...(props.style || {}), mixBlendMode: mark.mixBlendMode};
  }
  if (mark.opacity != null) props.opacity = mark.opacity;
  return props;
}

// Converts per-element channel values at index i into SVG attribute props,
// mirroring applyChannelStyles from style.js.
export function channelStyleProps(
  i: number,
  values: Record<string, any>,
  _options?: {tip?: boolean}
): Record<string, any> {
  const props: Record<string, any> = {};
  const {
    ariaLabel: AL,
    fill: F,
    fillOpacity: FO,
    stroke: S,
    strokeOpacity: SO,
    strokeWidth: SW,
    opacity: O,
    href: H
  } = values;
  if (AL) props["aria-label"] = AL[i];
  if (F) props.fill = F[i];
  if (FO) props.fillOpacity = FO[i];
  if (S) props.stroke = S[i];
  if (SO) props.strokeOpacity = SO[i];
  if (SW) props.strokeWidth = SW[i];
  if (O) props.opacity = O[i];
  if (H) props.href = H[i];
  return props;
}

// Converts per-group channel values (for grouped marks like Line, Area)
// using the first index of the group.
export function groupChannelStyleProps(group: number[], values: Record<string, any>): Record<string, any> {
  return channelStyleProps(group[0], values);
}

// Computes the SVG transform attribute for mark positioning,
// mirroring applyTransform from style.js.
export function computeTransform(
  mark: {dx?: number; dy?: number},
  scales: Record<string, any>,
  tx: number = 0,
  ty: number = 0
): string | undefined {
  tx += mark.dx || 0;
  ty += mark.dy || 0;
  const {x, y} = scales;
  if (x?.bandwidth) tx += x.bandwidth() / 2;
  if (y?.bandwidth) ty += y.bandwidth() / 2;
  if (tx || ty) return `translate(${tx},${ty})`;
  return undefined;
}

// Computes the frame anchor position for marks that use it (e.g., Dot).
export function computeFrameAnchor(frameAnchor: string | undefined, dimensions: Dimensions): [number, number] {
  const {width, height, marginTop, marginRight, marginBottom, marginLeft} = dimensions;
  return [
    /left$/.test(frameAnchor || "")
      ? marginLeft
      : /right$/.test(frameAnchor || "")
      ? width - marginRight
      : (marginLeft + width - marginRight) / 2,
    /^top/.test(frameAnchor || "")
      ? marginTop
      : /^bottom/.test(frameAnchor || "")
      ? height - marginBottom
      : (marginTop + height - marginBottom) / 2
  ];
}

// Resolves mark style defaults (fill, stroke, etc.) from options and defaults.
// This is the React equivalent of the `styles()` function in style.js,
// but returns resolved values instead of mutating a mark instance.
export interface ResolvedStyles {
  fill: string | undefined;
  fillOpacity: number | undefined;
  stroke: string | undefined;
  strokeWidth: number | undefined;
  strokeOpacity: number | undefined;
  strokeLinejoin: string | undefined;
  strokeLinecap: string | undefined;
  strokeMiterlimit: number | undefined;
  strokeDasharray: string | undefined;
  strokeDashoffset: string | undefined;
  opacity: number | undefined;
  mixBlendMode: string | undefined;
  paintOrder: string | undefined;
  pointerEvents: string | undefined;
  shapeRendering: string | undefined;
  ariaLabel: string | undefined;
  ariaDescription: string | undefined;
  ariaHidden: string | undefined;
  className: string | undefined;
  imageFilter: string | undefined;
  target: string | undefined;
}

const impliedString = (value: any, implied: string): string | undefined =>
  value == null || `${value}` === implied ? undefined : `${value}`;

const impliedNumber = (value: any, implied: number): number | undefined =>
  value == null || +value === implied ? undefined : +value;

export function resolveStyles(options: Record<string, any>, defaults: Record<string, any>): ResolvedStyles {
  const {
    fill,
    fillOpacity,
    stroke,
    strokeOpacity,
    strokeDasharray,
    strokeDashoffset,
    opacity,
    mixBlendMode,
    pointerEvents,
    shapeRendering,
    imageFilter,
    ariaLabel,
    ariaDescription,
    ariaHidden,
    className,
    target
  } = options;
  let {strokeWidth, strokeLinejoin, strokeLinecap, strokeMiterlimit, paintOrder} = options;

  const {
    fill: defaultFill = "currentColor",
    stroke: defaultStroke = "none",
    strokeWidth: defaultStrokeWidth,
    strokeLinecap: defaultStrokeLinecap,
    strokeLinejoin: defaultStrokeLinejoin,
    strokeMiterlimit: defaultStrokeMiterlimit,
    paintOrder: defaultPaintOrder
  } = defaults;

  // Apply defaults for constant values only (channels handled separately)
  const cfill = typeof fill === "string" ? fill : defaultFill;
  const cstroke = typeof stroke === "string" ? stroke : defaultStroke;

  if (cstroke !== "none") {
    if (strokeWidth === undefined) strokeWidth = defaultStrokeWidth;
    if (strokeLinecap === undefined) strokeLinecap = defaultStrokeLinecap;
    if (strokeLinejoin === undefined) strokeLinejoin = defaultStrokeLinejoin;
    if (strokeMiterlimit === undefined) strokeMiterlimit = defaultStrokeMiterlimit;
    if (cfill !== "none" && paintOrder === undefined) paintOrder = defaultPaintOrder;
  }

  return {
    fill: impliedString(cfill, "currentColor"),
    fillOpacity: impliedNumber(fillOpacity, 1),
    stroke: impliedString(cstroke, "none"),
    strokeWidth: impliedNumber(strokeWidth, 1),
    strokeOpacity: impliedNumber(strokeOpacity, 1),
    strokeLinejoin: impliedString(strokeLinejoin, "miter"),
    strokeLinecap: impliedString(strokeLinecap, "butt"),
    strokeMiterlimit: impliedNumber(strokeMiterlimit, 4),
    strokeDasharray: impliedString(strokeDasharray, "none"),
    strokeDashoffset: impliedString(strokeDashoffset, "0"),
    opacity: impliedNumber(opacity, 1),
    mixBlendMode: impliedString(mixBlendMode, "normal"),
    paintOrder: impliedString(paintOrder, "normal"),
    pointerEvents: impliedString(pointerEvents, "auto"),
    shapeRendering: impliedString(shapeRendering, "auto"),
    imageFilter: impliedString(imageFilter, "none"),
    ariaLabel: ariaLabel != null ? `${ariaLabel}` : undefined,
    ariaDescription: ariaDescription != null ? `${ariaDescription}` : undefined,
    ariaHidden: ariaHidden != null ? `${ariaHidden}` : undefined,
    className: className != null ? `${className}` : undefined,
    target: target != null ? `${target}` : undefined
  };
}
