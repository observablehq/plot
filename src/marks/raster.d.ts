import {Mark} from "../mark.js";

/** @jsdoc raster */
export function raster(...args: any[]): Raster;

/** @jsdoc interpolateNone */
export function interpolateNone(index: any, width: any, height: any, X: any, Y: any, V: any): any[];

/** @jsdoc interpolatorBarycentric */
export function interpolatorBarycentric({
  random
}?: {
  random?: (() => number) | undefined;
}): (index: any, width: any, height: any, X: any, Y: any, V: any) => any;

/** @jsdoc interpolateNearest */
export function interpolateNearest(index: any, width: any, height: any, X: any, Y: any, V: any): any;

/** @jsdoc interpolatorRandomWalk */
export function interpolatorRandomWalk({
  random,
  minDistance,
  maxSteps
}?: {
  random?: (() => number) | undefined;
  minDistance?: number | undefined;
  maxSteps?: number | undefined;
}): (index: any, width: any, height: any, X: any, Y: any, V: any) => any;

/** @jsdoc AbstractRaster */
export class AbstractRaster extends Mark {
  constructor(data: any, channels: any, options: {} | undefined, defaults: any);
  width: any;
  height: any;
  pixelSize: number;
  blur: number;
  interpolate: any;
}

/** @jsdoc Raster */
export class Raster extends AbstractRaster {
  constructor(data: any, options?: {});
  imageRendering: any;
  scale(
    channels: any,
    {
      color,
      ...scales
    }: {
      [x: string]: any;
      color: any;
    },
    context: any
  ): {
    [k: string]: any;
  };
  render(index: any, scales: any, channels: any, dimensions: any, context: any): any;
}
