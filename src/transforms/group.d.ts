import type {ChannelValueSpec} from "../channel.js";

export type ReducerName =
  | "first"
  | "last"
  | "count"
  | "distinct"
  | "sum"
  | "proportion"
  | "proportion-facet"
  | "deviation"
  | "min"
  | "min-index"
  | "max"
  | "max-index"
  | "mean"
  | "median"
  | "variance"
  | "mode"
  | `p${number}${number}` // percentile
  | "x"
  | "x1"
  | "x2"
  | "y"
  | "y1"
  | "y2";

export type ReducerFunction = (values: any[], extent: [min: any, max: any]) => any;

export interface ReducerImplementation {
  reduce(index: number[], values: any[], extent: [min: any, max: any]): any;
}

export type Reducer = ReducerName | ReducerFunction | ReducerImplementation;

export type Reducers = {
  [key: string]: Reducer;
};

export type Outputs<T> = {
  [key in keyof T]: ChannelValueSpec;
};

export function groupZ<A, B extends Reducers>(outputs: B, options: A): A & Outputs<B>;

export function groupX<A, B extends Reducers>(outputs: B, options: A): A & Outputs<B>;

export function groupY<A, B extends Reducers>(outputs: B, options: A): A & Outputs<B>;

export function group<A, B extends Reducers>(outputs: B, options: A): A & Outputs<B>;
