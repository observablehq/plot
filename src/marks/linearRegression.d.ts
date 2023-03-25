import type {ChannelValue, ChannelValueDenseBinSpec, ChannelValueSpec} from "../channel.js";
import type {Data, MarkOptions, RenderableMark} from "../mark.js";
import type {BinOptions, BinReducer} from "../transforms/bin.js";

interface LinearRegressionOptions extends MarkOptions, BinOptions {
  x?: ChannelValueSpec;
  y?: ChannelValueSpec;
  z?: ChannelValue;
  ci?: number;
  precision?: number;
  reduce?: BinReducer;
}

export interface LinearRegressionXOptions extends LinearRegressionOptions {
  y?: ChannelValueDenseBinSpec;
}

export interface LinearRegressionYOptions extends LinearRegressionOptions {
  x?: ChannelValueDenseBinSpec;
}

export function linearRegressionX(data?: Data, options?: LinearRegressionXOptions): RenderableMark;

export function linearRegressionY(data?: Data, options?: LinearRegressionYOptions): RenderableMark;
