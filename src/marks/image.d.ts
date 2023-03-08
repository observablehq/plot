import {Mark} from "../mark.js";

/** @jsdoc image */
export function image(data: any, options?: {}): Image;

/** @jsdoc Image */
export class Image extends Mark {
  constructor(data: any, options?: {});
  src: any;
  width: any;
  height: any;
  preserveAspectRatio: any;
  crossOrigin: any;
  frameAnchor: string;
  imageRendering: any;
  render(index: any, scales: any, channels: any, dimensions: any, context: any): any;
}
