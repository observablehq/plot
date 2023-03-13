import type {ChannelValue} from "../channel.js";
import type {CompoundMark, Data} from "../mark.js";
import type {Reducer} from "../reducer.js";
import type {BinOptions} from "../transforms/bin.js";

export interface AutoOptions {
  x?: ChannelValue | Reducer | ({value?: ChannelValue; reduce?: Reducer | null; zero?: boolean} & BinOptions);
  y?: ChannelValue | Reducer | ({value?: ChannelValue; reduce?: Reducer | null; zero?: boolean} & BinOptions);
  color?: ChannelValue | Reducer | {value?: ChannelValue; reduce?: Reducer | null; color?: string};
  size?: ChannelValue | Reducer | {value?: ChannelValue; reduce?: Reducer | null};
  fx?: ChannelValue | {value?: ChannelValue};
  fy?: ChannelValue | {value?: ChannelValue};
  mark?: "dot" | "line" | "area" | "rule" | "bar";
}

export interface AutoSpec extends AutoOptions {
  x: {value: ChannelValue; reduce: Reducer | null; zero?: boolean} & BinOptions;
  y: {value: ChannelValue; reduce: Reducer | null; zero?: boolean} & BinOptions;
  color: {value: ChannelValue; reduce: Reducer | null; color?: string};
  size: {value: ChannelValue; reduce: Reducer | null};
  fx: ChannelValue;
  fy: ChannelValue;
  mark: "dot" | "line" | "area" | "rule" | "bar";
}

export function autoSpec(data?: Data, options?: AutoOptions): AutoSpec;

export function auto(data?: Data, options?: AutoOptions): CompoundMark;
