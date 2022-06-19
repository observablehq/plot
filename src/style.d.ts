export function styles(mark: any, { title, href, ariaLabel: variaLabel, ariaDescription, ariaHidden, target, fill, fillOpacity, stroke, strokeWidth, strokeOpacity, strokeLinejoin, strokeLinecap, strokeMiterlimit, strokeDasharray, strokeDashoffset, opacity, mixBlendMode, paintOrder, shapeRendering }: {
    title: any;
    href: any;
    ariaLabel: any;
    ariaDescription: any;
    ariaHidden: any;
    target: any;
    fill: any;
    fillOpacity: any;
    stroke: any;
    strokeWidth: any;
    strokeOpacity: any;
    strokeLinejoin: any;
    strokeLinecap: any;
    strokeMiterlimit: any;
    strokeDasharray: any;
    strokeDashoffset: any;
    opacity: any;
    mixBlendMode: any;
    paintOrder: any;
    shapeRendering: any;
}, channels: any, { ariaLabel: cariaLabel, fill: defaultFill, fillOpacity: defaultFillOpacity, stroke: defaultStroke, strokeOpacity: defaultStrokeOpacity, strokeWidth: defaultStrokeWidth, strokeLinecap: defaultStrokeLinecap, strokeLinejoin: defaultStrokeLinejoin, strokeMiterlimit: defaultStrokeMiterlimit, paintOrder: defaultPaintOrder }: {
    ariaLabel: any;
    fill?: string;
    fillOpacity: any;
    stroke?: string;
    strokeOpacity: any;
    strokeWidth: any;
    strokeLinecap: any;
    strokeLinejoin: any;
    strokeMiterlimit: any;
    paintOrder: any;
}): any[];
export function applyTitle(selection: any, L: any): void;
export function applyTitleGroup(selection: any, L: any): void;
export function applyText(selection: any, T: any): void;
export function applyTextGroup(selection: any, T: any): void;
export function applyChannelStyles(selection: any, { target }: {
    target: any;
}, { ariaLabel: AL, title: T, fill: F, fillOpacity: FO, stroke: S, strokeOpacity: SO, strokeWidth: SW, opacity: O, href: H }: {
    ariaLabel: any;
    title: any;
    fill: any;
    fillOpacity: any;
    stroke: any;
    strokeOpacity: any;
    strokeWidth: any;
    opacity: any;
    href: any;
}): void;
export function applyGroupedChannelStyles(selection: any, { target }: {
    target: any;
}, { ariaLabel: AL, title: T, fill: F, fillOpacity: FO, stroke: S, strokeOpacity: SO, strokeWidth: SW, opacity: O, href: H }: {
    ariaLabel: any;
    title: any;
    fill: any;
    fillOpacity: any;
    stroke: any;
    strokeOpacity: any;
    strokeWidth: any;
    opacity: any;
    href: any;
}): void;
export function groupIndex(I: any, position: any, { z }: {
    z: any;
}, channels: any): Generator<any[], void, unknown>;
export function maybeClip(clip: any): false | "frame";
export function applyIndirectStyles(selection: any, mark: any, { width, height, marginLeft, marginRight, marginTop, marginBottom }: {
    width: any;
    height: any;
    marginLeft: any;
    marginRight: any;
    marginTop: any;
    marginBottom: any;
}): void;
export function applyDirectStyles(selection: any, mark: any): void;
export function applyAttr(selection: any, name: any, value: any): void;
export function applyStyle(selection: any, name: any, value: any): void;
export function applyTransform(selection: any, x: any, y: any, tx: any, ty: any): void;
export function impliedString(value: any, impliedValue: any): any;
export function impliedNumber(value: any, impliedValue: any): any;
export function maybeClassName(name: any): any;
export function applyInlineStyles(selection: any, style: any): void;
export function applyFrameAnchor({ frameAnchor }: {
    frameAnchor: any;
}, { width, height, marginTop, marginRight, marginBottom, marginLeft }: {
    width: any;
    height: any;
    marginTop: any;
    marginRight: any;
    marginBottom: any;
    marginLeft: any;
}): any[];
export const offset: 0 | 0.5;
