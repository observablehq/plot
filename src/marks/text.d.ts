export function text(data: any, { x, y, ...options }?: {
    x: any;
    y: any;
}): Text;
export function textX(data: any, { x, ...options }?: {
    x?: {
        transform: (d: any) => any;
    };
}): Text;
export function textY(data: any, { y, ...options }?: {
    y?: {
        transform: (d: any) => any;
    };
}): Text;
export class Text extends Mark<any, any[]> {
    constructor(data: any, options?: {});
    rotate: any;
    textAnchor: any;
    lineAnchor: string;
    lineHeight: number;
    lineWidth: number;
    monospace: boolean;
    fontFamily: any;
    fontSize: any;
    fontStyle: any;
    fontVariant: any;
    fontWeight: any;
    frameAnchor: string;
    render(index: any, { x, y }: {
        x: any;
        y: any;
    }, channels: any, dimensions: any): any;
}
import { Mark } from "../plot.js";
