import type {ChannelValueSpec} from "../channel.js";
import type {Data, MarkOptions, RenderableMark} from "../mark.js";

export interface LinearRegressionOptions extends MarkOptions {
  x?: ChannelValueSpec;
  y?: ChannelValueSpec;
  z?: ChannelValueSpec;
  ci?: number;
  precision?: number;
}

export function linearRegressionX(data?: Data, options?: LinearRegressionOptions): RenderableMark;

export function linearRegressionY(data?: Data, options?: LinearRegressionOptions): RenderableMark;
