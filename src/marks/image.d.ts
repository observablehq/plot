export function image(data: any, { x, y, ...options }?: {
    x: any;
    y: any;
}): Image;
export class Image extends Mark<any, any[]> {
    constructor(data: any, options?: {});
    src: any;
    width: any;
    height: any;
    preserveAspectRatio: any;
    crossOrigin: any;
    frameAnchor: string;
    render(index: any, { x, y }: {
        x: any;
        y: any;
    }, channels: any, dimensions: any): any;
}
import { Mark } from "../plot.js";
