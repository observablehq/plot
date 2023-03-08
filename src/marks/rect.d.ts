import {Mark} from "../mark.js";

/** @jsdoc rect */
export function rect(data: any, options: any): Rect;

/** @jsdoc rectX */
export function rectX(
  data: any,
  options?: {
    y: (d: any, i: any) => any;
    interval: number;
    x2: {
      transform: (d: any) => any;
    };
  }
): Rect;

/** @jsdoc rectY */
export function rectY(
  data: any,
  options?: {
    x: (d: any, i: any) => any;
    interval: number;
    y2: {
      transform: (d: any) => any;
    };
  }
): Rect;

/** @jsdoc Rect */
export class Rect extends Mark {
  constructor(data: any, options?: {});
  insetTop: any;
  insetRight: any;
  insetBottom: any;
  insetLeft: any;
  rx: any;
  ry: any;
  render(index: any, scales: any, channels: any, dimensions: any, context: any): any;
}
