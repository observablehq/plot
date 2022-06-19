export function Scales(channels: any, { inset: globalInset, insetTop: globalInsetTop, insetRight: globalInsetRight, insetBottom: globalInsetBottom, insetLeft: globalInsetLeft, round, nice, clamp, align, padding, ...options }?: {
    inset?: number;
    insetTop?: any;
    insetRight?: any;
    insetBottom?: any;
    insetLeft?: any;
    round: any;
    nice: any;
    clamp: any;
    align: any;
    padding: any;
}): {};
export function ScaleFunctions(scales: any): {
    [k: string]: any;
};
export function autoScaleRange({ x, y, fx, fy }: {
    x: any;
    y: any;
    fx: any;
    fy: any;
}, dimensions: any): void;
export function normalizeScale(key: any, scale: any, hint: any): any;
export function isTemporalScale({ type }: {
    type: any;
}): boolean;
export function isOrdinalScale({ type }: {
    type: any;
}): boolean;
export function isDivergingScale({ type }: {
    type: any;
}): boolean;
export function scaleOrder({ range, domain }: {
    range: any;
    domain?: any;
}): number;
export function applyScales(channels: any, scales: any): any;
export function isCollapsed(scale: any): boolean;
export function coerceNumber(x: any): number;
export function coerceDate(x: any): any;
export function scale(options?: {}): {
    type: string;
    apply: (d: any) => any;
    invert: (d: any) => any;
} | {
    invert: (t: any) => any;
    apply: (t: any) => any;
    bandwidth: any;
    step: any;
    paddingInner: any;
    paddingOuter: any;
    align: any;
    round: any;
    constant: any;
    exponent: any;
    base: any;
    pivot: any;
    symmetric: boolean;
    clamp: any;
    interpolate: any;
    unknown: any;
    label: any;
    percent: any;
    transform: any;
    range: any[];
    type: any;
    domain: any[];
} | {
    invert: (t: any) => any;
    apply: (t: any) => any;
    bandwidth: any;
    step: any;
    padding: any;
    align: any;
    round: any;
    constant: any;
    exponent: any;
    base: any;
    pivot: any;
    symmetric: boolean;
    clamp: any;
    interpolate: any;
    unknown: any;
    label: any;
    percent: any;
    transform: any;
    range: any[];
    type: any;
    domain: any[];
};
export function exposeScales(scaleDescriptors: any): (key: any) => {
    type: string;
    apply: (d: any) => any;
    invert: (d: any) => any;
} | {
    invert: (t: any) => any;
    apply: (t: any) => any;
    bandwidth: any;
    step: any;
    paddingInner: any;
    paddingOuter: any;
    align: any;
    round: any;
    constant: any;
    exponent: any;
    base: any;
    pivot: any;
    symmetric: boolean;
    clamp: any;
    interpolate: any;
    unknown: any;
    label: any;
    percent: any;
    transform: any;
    range: any[];
    type: any;
    domain: any[];
} | {
    invert: (t: any) => any;
    apply: (t: any) => any;
    bandwidth: any;
    step: any;
    padding: any;
    align: any;
    round: any;
    constant: any;
    exponent: any;
    base: any;
    pivot: any;
    symmetric: boolean;
    clamp: any;
    interpolate: any;
    unknown: any;
    label: any;
    percent: any;
    transform: any;
    range: any[];
    type: any;
    domain: any[];
};
