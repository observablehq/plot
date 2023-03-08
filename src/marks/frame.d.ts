import {Mark} from "../mark.js";

/** @jsdoc frame */
export function frame(options: any): Frame;

/** @jsdoc Frame */
export class Frame extends Mark {
  constructor(options?: {});
  anchor: string | undefined;
  insetTop: any;
  insetRight: any;
  insetBottom: any;
  insetLeft: any;
  rx: any;
  ry: any;
  render(index: any, scales: any, channels: any, dimensions: any, context: any): any;
}
