import {Mark} from "../mark.js";

/** @jsdoc geo */
export function geo(
  data: any,
  {
    geometry,
    ...options
  }?: {
    geometry?:
      | {
          transform: (d: any) => any;
        }
      | undefined;
  }
): Geo;

/** @jsdoc sphere */
export function sphere({strokeWidth, ...options}?: {strokeWidth?: number | undefined}): Geo;

/** @jsdoc graticule */
export function graticule({strokeOpacity, ...options}?: {strokeOpacity?: number | undefined}): Geo;

/** @jsdoc Geo */
export class Geo extends Mark {
  constructor(data: any, options?: {});
  r: any;
  render(index: any, scales: any, channels: any, dimensions: any, context: any): any;
}
