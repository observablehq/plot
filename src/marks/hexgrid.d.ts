import {Mark} from "../mark.js";

/** @jsdoc hexgrid */
export function hexgrid(options: any): Hexgrid;

/** @jsdoc Hexgrid */
export class Hexgrid extends Mark {
  constructor({binWidth, clip, ...options}?: {binWidth?: number | undefined; clip?: boolean | undefined});
  binWidth: any;
  render(index: any, scales: any, channels: any, dimensions: any, context: any): any;
}
