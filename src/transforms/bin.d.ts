import type {ChannelReducers} from "../channel.js";
import type {Interval, RangeInterval} from "../interval.js";
import type {Reducer} from "../reducer.js";
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

export interface BinReducers extends BinOptions {
  data?: Reducer | null;
  filter?: Reducer | null;
  sort?: Reducer | null;
  reverse?: boolean;
}

export function binX<T>(outputs?: ChannelReducers & BinReducers, options?: T & BinOptions): Transformed<T>;

export function binY<T>(outputs?: ChannelReducers & BinReducers, options?: T & BinOptions): Transformed<T>;

export function bin<T>(outputs?: ChannelReducers & BinReducers, options?: T & BinOptions): Transformed<T>;
