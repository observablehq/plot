import type {ChannelValue} from "../channel.js";
import type {Data, RenderableMark} from "../mark.js";
import type {RasterOptions} from "./raster.js";

export interface ContourOptions extends Omit<RasterOptions, "imageRendering"> {
  smooth?: boolean;
  value?: ChannelValue;
}

export function contour(options?: ContourOptions): Contour;
export function contour(data?: Data, options?: ContourOptions): Contour;

export class Contour extends RenderableMark {}
