import {Mark} from "../mark.js";

/** @jsdoc text */
export function text(data: any, options?: {}): Text;

/** @jsdoc textX */
export function textX(data: any, options?: {}): Text;

/** @jsdoc textY */
export function textY(data: any, options?: {}): Text;

/** @jsdoc Text */
export class Text extends Mark {
  constructor(data: any, options?: {});
  rotate: any;
  textAnchor: any;
  lineAnchor: string;
  lineHeight: number;
  lineWidth: number;
  textOverflow: string | null;
  monospace: boolean;
  fontFamily: any;
  fontSize: any;
  fontStyle: any;
  fontVariant: any;
  fontWeight: any;
  frameAnchor: string;
  splitLines: (text: any) => any;
  clipLine: ((text: any) => any) | undefined;
  render(index: any, scales: any, channels: any, dimensions: any, context: any): any;
}
