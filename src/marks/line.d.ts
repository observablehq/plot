export function line(data: any, { x, y, ...options }?: {
    x: any;
    y: any;
}): Line;
export function lineX(data: any, { x, y, ...options }?: {
    x?: {
        transform: (d: any) => any;
    };
    y?: (d: any, i: any) => any;
}): Line;
export function lineY(data: any, { x, y, ...options }?: {
    x?: (d: any, i: any) => any;
    y?: {
        transform: (d: any) => any;
    };
}): Line;
export class Line extends Mark<any, any[]> {
    constructor(data: any, options?: {});
    z: any;
    curve: any;
    filter(index: any): any;
    render(I: any, { x, y }: {
        x: any;
        y: any;
    }, channels: any, dimensions: any): any;
}
import { Mark } from "../plot.js";
