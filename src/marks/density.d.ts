import type {ChannelValue, ChannelValueSpec} from "../channel.js";
import type {Data, MarkOptions, RenderableMark} from "../mark.js";

export interface DensityOptions extends MarkOptions {
  x?: ChannelValueSpec;
  y?: ChannelValueSpec;
  z?: ChannelValue;
  weight?: ChannelValue;
  bandwidth?: number;
  thresholds?: number | Iterable<number>;
}

export function density(data?: Data, options?: DensityOptions): Density;

export class Density extends RenderableMark {}
