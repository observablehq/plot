import type {ChannelValue} from "../channel.js";
import type {RangeInterval} from "../interval.js";
import type {Data, RenderableMark} from "../mark.js";
import type {Thresholds} from "../transforms/bin.js";
import type {RasterOptions, RasterSampler} from "./raster.js";

export interface ContourOptions extends Omit<RasterOptions, "imageRendering"> {
  smooth?: boolean;
  value?: ChannelValue | RasterSampler;
  thresholds?: Thresholds;
  interval?: RangeInterval;
}

export function contour(options?: ContourOptions): Contour;

export function contour(data?: Data, options?: ContourOptions): Contour;

export class Contour extends RenderableMark {}
