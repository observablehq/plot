import type {ChannelValueSpec} from "../channel.js";
import type {Data, MarkOptions, RenderableMark} from "../mark.js";

export type RasterInterpolateName = "nearest" | "barycentric" | "random-walk";

export type RasterInterpolateFunction = (
  index: number[],
  width: number,
  height: number,
  X: number[],
  Y: number[],
  V: any[]
) => any[];

export type RasterInterpolate = RasterInterpolateName | RasterInterpolateFunction;

export type RandomSource = () => number;

export type RasterSampler = (x: number, y: number, facet: number[] & {fx: any; fy: any}) => any;

export interface RasterOptions extends Omit<MarkOptions, "fill" | "fillOpacity"> {
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
  interpolate?: RasterInterpolate | "none" | null;
  imageRendering?: string;
  fill?: ChannelValueSpec | RasterSampler;
  fillOpacity?: ChannelValueSpec | RasterSampler;
}

export function raster(options?: RasterOptions): Raster;

export function raster(data?: Data, options?: RasterOptions): Raster;

export const interpolateNone: RasterInterpolateFunction;

export function interpolatorBarycentric(options?: {random?: RandomSource}): RasterInterpolateFunction;

export const interpolateNearest: RasterInterpolateFunction;

export function interpolatorRandomWalk(options?: {
  random?: RandomSource;
  minDistance?: number;
  maxSteps?: number;
}): RasterInterpolateFunction;

export class Raster extends RenderableMark {}
