import {Mark} from "../mark.js";

/** @jsdoc line */
export function line(data: any, options?: {}): Line;

/** @jsdoc lineX */
export function lineX(data: any, options?: {}): Line;

/** @jsdoc lineY */
export function lineY(data: any, options?: {}): Line;

/** @jsdoc Line */
export class Line extends Mark {
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
