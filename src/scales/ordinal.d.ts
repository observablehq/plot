export function ScaleO(scale: any, channels: any, { type, domain, range, reverse, hint }: {
    type: any;
    domain?: any;
    range: any;
    reverse: any;
    hint: any;
}): {
    type: any;
    domain: any;
    range: any;
    scale: any;
    hint: any;
};
export function ScaleOrdinal(key: any, channels: any, { type, domain, range, scheme, unknown, ...options }: {
    [x: string]: any;
    type: any;
    domain?: any;
    range: any;
    scheme: any;
    unknown: any;
}): {
    type: any;
    domain: any;
    range: any;
    scale: any;
    hint: any;
};
export function ScalePoint(key: any, channels: any, { align, padding, ...options }: {
    [x: string]: any;
    align?: number;
    padding?: number;
}): any;
export function ScaleBand(key: any, channels: any, { align, padding, paddingInner, paddingOuter, ...options }: {
    [x: string]: any;
    align?: number;
    padding?: number;
    paddingInner?: any;
    paddingOuter?: any;
}): any;
export const ordinalImplicit: unique symbol;
