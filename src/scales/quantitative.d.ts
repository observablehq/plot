export function Interpolator(interpolate: any): any;
export function ScaleQ(key: any, scale: any, channels: any, { type, nice, clamp, zero, domain, unknown, round, scheme, range, interpolate, reverse }: {
    type: any;
    nice: any;
    clamp: any;
    zero: any;
    domain?: any[];
    unknown: any;
    round: any;
    scheme: any;
    range?: any;
    interpolate?: any;
    reverse: any;
}): {
    type: any;
    domain: any;
    range: any;
    scale: any;
    interpolate: any;
};
export function ScaleLinear(key: any, channels: any, options: any): {
    type: any;
    domain: any;
    range: any;
    scale: any;
    interpolate: any;
};
export function ScaleSqrt(key: any, channels: any, options: any): {
    type: any;
    domain: any;
    range: any;
    scale: any;
    interpolate: any;
};
export function ScalePow(key: any, channels: any, { exponent, ...options }: {
    [x: string]: any;
    exponent?: number;
}): {
    type: any;
    domain: any;
    range: any;
    scale: any;
    interpolate: any;
};
export function ScaleLog(key: any, channels: any, { base, domain, ...options }: {
    [x: string]: any;
    base?: number;
    domain?: any[];
}): {
    type: any;
    domain: any;
    range: any;
    scale: any;
    interpolate: any;
};
export function ScaleSymlog(key: any, channels: any, { constant, ...options }: {
    [x: string]: any;
    constant?: number;
}): {
    type: any;
    domain: any;
    range: any;
    scale: any;
    interpolate: any;
};
export function ScaleQuantile(key: any, channels: any, { range, quantiles, n, scheme, domain, interpolate, reverse }: {
    range: any;
    quantiles?: number;
    n?: any;
    scheme?: string;
    domain?: any[];
    interpolate: any;
    reverse: any;
}): {
    type: string;
    scale: any;
    domain: any;
    range: any;
};
export function ScaleQuantize(key: any, channels: any, { range, n, scheme, domain, interpolate, reverse }: {
    range: any;
    n?: number;
    scheme?: string;
    domain?: any[];
    interpolate: any;
    reverse: any;
}): {
    type: string;
    scale: any;
    domain: any;
    range: any;
};
export function ScaleThreshold(key: any, channels: any, { domain, unknown, scheme, interpolate, range, reverse }: {
    domain?: number[];
    unknown: any;
    scheme?: string;
    interpolate: any;
    range?: any;
    reverse: any;
}): {
    type: string;
    scale: any;
    domain: any;
    range: any;
};
export function ScaleIdentity(): {
    type: string;
    scale: any;
};
export function inferDomain(channels: any, f?: typeof finite): any[];
export function interpolatePiecewise(interpolate: any): (i: any, j: any) => (t: any) => any;
export function flip(i: any): (t: any) => any;
import { finite } from "../defined.js";
