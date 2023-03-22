import type {ChannelReducers} from "../channel.js";
import type {RangeInterval} from "../interval.js";
import type {Reducer} from "../reducer.js";
import type {Transformed} from "./basic.js";

export type ThresholdsName = "freedman-diaconis" | "scott" | "sturges" | "auto";

export type ThresholdsFunction = (values: any[], min: any, max: any) => any[];

export type Thresholds = ThresholdsName | ThresholdsFunction | RangeInterval;

export interface BinOptions {
  cumulative?: boolean | number;
  domain?: ((values: any[]) => [min: any, max: any]) | [min: any, max: any];
  thresholds?: Thresholds;
  interval?: RangeInterval;
}

export type BinReducer =
  | Reducer
  | BinReducerFunction
  | BinReducerImplementation
  | "x"
  | "x1"
  | "x2"
  | "y"
  | "y1"
  | "y2";

export type BinReducerFunction = (values: any[], extent: {x1: any; y1: any; x2: any; y2: any}) => any;

// TODO scope, label
export interface BinReducerImplementation {
  reduceIndex(index: number[], values: any[], extent: {x1: any; y1: any; x2: any; y2: any}): any;
}

export interface BinOutputOptions extends BinOptions {
  data?: BinReducer | null;
  filter?: BinReducer | null;
  sort?: BinReducer | null;
  reverse?: boolean;
}

/** How to reduce binned channel values. */
export type BinOutputs = ChannelReducers<BinReducer> & BinOutputOptions;

export function binX<T>(outputs?: BinOutputs, options?: T & BinOptions): Transformed<T>;

export function binY<T>(outputs?: BinOutputs, options?: T & BinOptions): Transformed<T>;

export function bin<T>(outputs?: BinOutputs, options?: T & BinOptions): Transformed<T>;
