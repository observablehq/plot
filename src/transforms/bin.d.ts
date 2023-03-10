import type {ChannelOutputs, ChannelReducers, Reducer} from "../channel.js";
import type {Interval, RangeInterval} from "../interval.js";
import type {MarkOptions} from "../mark.js";
import type {Transformed} from "./basic.js";

export type ThresholdsName = "freedman-diaconis" | "scott" | "sturges" | "auto";

export type ThresholdsFunction = (values: any[], min: any, max: any) => any[];

export type Thresholds = ThresholdsName | ThresholdsFunction | Interval;

export interface BinOptions {
  cumulative?: boolean | number;
  domain?: ((values: any[]) => [min: any, max: any]) | [min: any, max: any];
  thresholds?: Thresholds;
  interval?: RangeInterval;
}

export interface BinOutputs extends BinOptions {
  data?: Reducer;
  filter?: Reducer;
  sort?: Reducer;
  reverse?: boolean;
}

export function binX<T extends MarkOptions, S extends ChannelReducers>(
  outputs?: S & BinOutputs,
  options?: T & BinOptions
): Transformed<Omit<T, keyof (S & BinOutputs)> & ChannelOutputs<Omit<S, keyof BinOutputs>>>;

export function binY<T extends MarkOptions, S extends ChannelReducers>(
  outputs?: S & BinOutputs,
  options?: T & BinOptions
): Transformed<Omit<T, keyof (S & BinOutputs)> & ChannelOutputs<Omit<S, keyof BinOutputs>>>;

export function bin<T extends MarkOptions, S extends ChannelReducers>(
  outputs?: S & BinOutputs,
  options?: T & BinOptions
): Transformed<Omit<T, keyof (S & BinOutputs)> & ChannelOutputs<Omit<S, keyof BinOutputs>>>;
