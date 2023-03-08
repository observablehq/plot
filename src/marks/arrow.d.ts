import {Mark} from "../mark.js";

/** @jsdoc arrow */
export function arrow(data: any, options?: {}): Arrow;

/** @jsdoc Arrow */
export class Arrow extends Mark {
  constructor(data: any, options?: {});
  bend: number;
  headAngle: number;
  headLength: number;
  insetStart: number;
  insetEnd: number;
  render(index: any, scales: any, channels: any, dimensions: any, context: any): any;
}
