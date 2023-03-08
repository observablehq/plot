import {Mark} from "../mark.js";

/** @jsdoc dot */
export function dot(data: any, options?: {}): Dot;

/** @jsdoc dotX */
export function dotX(data: any, options?: {}): Dot;

/** @jsdoc dotY */
export function dotY(data: any, options?: {}): Dot;

/** @jsdoc circle */
export function circle(data: any, options: any): Dot;

/** @jsdoc hexagon */
export function hexagon(data: any, options: any): Dot;

/** @jsdoc Dot */
export class Dot extends Mark {
  constructor(data: any, options?: {});
  r: any;
  rotate: any;
  symbol: any;
  frameAnchor: string;
  render(index: any, scales: any, channels: any, dimensions: any, context: any): any;
}
