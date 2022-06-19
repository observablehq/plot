export function area(data: any, options: any): Area;
export function areaX(data: any, options: any): Area;
export function areaY(data: any, options: any): Area;
export class Area extends Mark<any, any[]> {
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
