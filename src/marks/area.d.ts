import {Mark} from "../mark.js";

/** @jsdoc area */
export function area(data: any, options: any): Area;

/** @jsdoc areaX */
export function areaX(data: any, options: any): Area;

/** @jsdoc areaY */
export function areaY(data: any, options: any): Area;

/** @jsdoc Area */
export class Area extends Mark {
  constructor(data: any, options?: {});
  z: any;
  curve:
    | import("d3-shape").CurveFactory
    | import("d3-shape").CurveBundleFactory
    | import("d3-shape").CurveCardinalFactory
    | import("d3-shape").CurveCatmullRomFactory;
  filter(index: any): any;
  render(index: any, scales: any, channels: any, dimensions: any, context: any): any;
}
