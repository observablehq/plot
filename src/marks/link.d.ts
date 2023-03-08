import {Mark} from "../mark.js";

/** @jsdoc link */
export function link(data: any, options?: {}): Link;

/** @jsdoc Link */
export class Link extends Mark {
  constructor(data: any, options?: {});
  curve:
    | import("d3-shape").CurveFactory
    | import("d3-shape").CurveBundleFactory
    | import("d3-shape").CurveCardinalFactory
    | import("d3-shape").CurveCatmullRomFactory;
  render(index: any, scales: any, channels: any, dimensions: any, context: any): any;
}
