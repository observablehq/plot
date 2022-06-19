export function vector(data: any, { x, y, ...options }?: {
    x: any;
    y: any;
}): Vector;
export function vectorX(data: any, { x, ...options }?: {
    x?: {
        transform: (d: any) => any;
    };
}): Vector;
export function vectorY(data: any, { y, ...options }?: {
    y?: {
        transform: (d: any) => any;
    };
}): Vector;
export class Vector extends Mark<any, any[]> {
    constructor(data: any, options?: {});
    length: any;
    rotate: any;
    anchor: string;
    frameAnchor: string;
    render(index: any, { x, y }: {
        x: any;
        y: any;
    }, channels: any, dimensions: any): any;
}
import { Mark } from "../plot.js";
