import type {ScaleName, ScaleType} from "./scales.js";

export interface ChannelTransform {
  transform: (data: any[]) => any[];
}

// TODO Adopt stricter Channel instead of ChannelSpec.
export type Channels = {[name: string]: ChannelSpec};

export type ChannelValues = {[name: string]: any[]};

export interface ChannelSpec {
  value: ChannelValueSpec | null;
  scale?: ScaleName | "auto" | boolean;
  type?: ScaleType;
  optional?: boolean;
  filter?: (value: any) => boolean;
  hint?: any; // TODO
}

export type ChannelValue =
  | Iterable<any> // column of values
  | string // field name, or literal color
  | Date // constant
  | number // constant
  | boolean // constant
  | null // constant
  | ((d: any, i: number) => any) // function of data
  | ChannelTransform; // function of data

export type ChannelValueSpec = ChannelValue | Pick<ChannelSpec, "value" | "scale">;

export type ChannelDomainSort = {
  [name: string]:
    | string
    | Reducer // reduce
    | boolean // reverse
    | number // limit
    | null
    | undefined
    | {
        value: string | null; // channel name, "data", "width", "height"
        reduce?: Reducer;
        reverse?: boolean;
        limit?: number;
      };
  reduce?: Reducer;
  reverse?: boolean;
  limit?: number;
};

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
