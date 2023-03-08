import {Mark} from "../mark.js";

/** @jsdoc vector */
export function vector(data: any, options?: {}): Vector;

/** @jsdoc vectorX */
export function vectorX(data: any, options?: {}): Vector;

/** @jsdoc vectorY */
export function vectorY(data: any, options?: {}): Vector;

/** @jsdoc spike */
export function spike(data: any, options?: {}): Vector;

/** @jsdoc Vector */
export class Vector extends Mark {
  constructor(data: any, options?: {});
  r: number;
  length: any;
  rotate: any;
  shape: any;
  anchor: string;
  frameAnchor: string;
  render(index: any, scales: any, channels: any, dimensions: any, context: any): any;
}
