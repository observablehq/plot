export function dot(data: any, { x, y, ...options }?: {
    x: any;
    y: any;
}): Dot;
export function dotX(data: any, { x, ...options }?: {
    x?: {
        transform: (d: any) => any;
    };
}): Dot;
export function dotY(data: any, { y, ...options }?: {
    y?: {
        transform: (d: any) => any;
    };
}): Dot;
export class Dot extends Mark<any, any[]> {
    constructor(data: any, options?: {});
    r: any;
    rotate: any;
    symbol: any;
    frameAnchor: string;
    render(index: any, { x, y }: {
        x: any;
        y: any;
    }, channels: any, dimensions: any): any;
}
import { Mark } from "../plot.js";
