export function ScaleDiverging(key: any, channels: any, options: any): {
    type: any;
    domain: any[];
    pivot: number;
    interpolate: any;
    scale: any;
};
export function ScaleDivergingSqrt(key: any, channels: any, options: any): {
    type: any;
    domain: any[];
    pivot: number;
    interpolate: any;
    scale: any;
};
export function ScaleDivergingPow(key: any, channels: any, { exponent, ...options }: {
    [x: string]: any;
    exponent?: number;
}): {
    type: any;
    domain: any[];
    pivot: number;
    interpolate: any;
    scale: any;
};
export function ScaleDivergingLog(key: any, channels: any, { base, pivot, domain, ...options }: {
    [x: string]: any;
    base?: number;
    pivot?: number;
    domain?: any[];
}): {
    type: any;
    domain: any[];
    pivot: number;
    interpolate: any;
    scale: any;
};
export function ScaleDivergingSymlog(key: any, channels: any, { constant, ...options }: {
    [x: string]: any;
    constant?: number;
}): {
    type: any;
    domain: any[];
    pivot: number;
    interpolate: any;
    scale: any;
};
