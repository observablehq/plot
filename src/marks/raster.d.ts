import type {ChannelValueSpec} from "../channel.js";
import type {Data, MarkOptions, RenderableMark} from "../mark.js";

export type RasterInterpolateName = "none" | "nearest" | "barycentric" | "random-walk";

export type RasterInterpolate = (
  index: number[],
  width: number,
  height: number,
  X: number[],
  Y: number[],
  V: any[]
) => any[];

export type RandomSource = () => number;

export interface RasterOptions extends MarkOptions {
  x?: ChannelValueSpec;
  y?: ChannelValueSpec;
  x1?: number;
  x2?: number;
  y1?: number;
  y2?: number;
  width?: number;
  height?: number;
  pixelSize?: number;
  blur?: number;
  interpolate?: RasterInterpolate;
  imageRendering?: string;
}

export function raster(options?: RasterOptions): Raster;
export function raster(data?: Data, options?: RasterOptions): Raster;

export const interpolateNone: RasterInterpolate;

export function interpolatorBarycentric(options?: {random?: RandomSource}): RasterInterpolate;

export const interpolateNearest: RasterInterpolate;

export function interpolatorRandomWalk(options?: {
  random?: RandomSource;
  minDistance?: number;
  maxSteps?: number;
}): RasterInterpolate;

export class Raster extends RenderableMark {}
