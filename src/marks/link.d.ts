export function link(data: any, { x, x1, x2, y, y1, y2, ...options }?: {
    x: any;
    x1: any;
    x2: any;
    y: any;
    y1: any;
    y2: any;
}): Link;
export function maybeSameValue(x: any, x1: any, x2: any): any[];
export class Link extends Mark<any, any[]> {
    constructor(data: any, options?: {});
    curve: any;
    render(index: any, { x, y }: {
        x: any;
        y: any;
    }, channels: any, dimensions: any): any;
}
import { Mark } from "../plot.js";
