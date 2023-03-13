import type {ChannelValue, ChannelValueSpec} from "../channel.js";
import type {Data, MarkOptions, RenderableMark} from "../mark.js";
import type {Reducer} from "../reducer.js";
import type {BinOptions} from "../transforms/bin.js";

interface LinearRegressionOptions extends MarkOptions, BinOptions {
  x?: ChannelValueSpec;
  y?: ChannelValueSpec;
  z?: ChannelValue;
  ci?: number;
  precision?: number;
  reduce?: Reducer;
}

export interface LinearRegressionXOptions extends LinearRegressionOptions {
  y?: ChannelValueSpec & Omit<BinOptions, "interval">; // interval must be mark-level option
}

export interface LinearRegressionYOptions extends LinearRegressionOptions {
  x?: ChannelValueSpec & Omit<BinOptions, "interval">; // interval must be mark-level option
}

export function linearRegressionX(data?: Data, options?: LinearRegressionXOptions): RenderableMark;

export function linearRegressionY(data?: Data, options?: LinearRegressionYOptions): RenderableMark;
