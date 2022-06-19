export function ruleX(data: any, options: any): RuleX;
export function ruleY(data: any, options: any): RuleY;
export class RuleX extends Mark<any, any[]> {
    constructor(data: any, options?: {});
    insetTop: any;
    insetBottom: any;
    render(index: any, { x, y }: {
        x: any;
        y: any;
    }, channels: any, dimensions: any): any;
}
export class RuleY extends Mark<any, any[]> {
    constructor(data: any, options?: {});
    insetRight: any;
    insetLeft: any;
    render(index: any, { x, y }: {
        x: any;
        y: any;
    }, channels: any, dimensions: any): any;
}
import { Mark } from "../plot.js";
