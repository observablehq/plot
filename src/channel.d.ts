import type {ScaleName, ScaleType} from "./scales.js";

export interface ChannelTransform {
  transform: (data: any[]) => any[];
}

export type ChannelName =
  | "ariaLabel"
  | "fill"
  | "fillOpacity"
  | "fontSize"
  | "fx" // TODO separate FacetChannelName?
  | "fy" // TODO separate FacetChannelName?
  | "geometry"
  | "height"
  | "href"
  | "length"
  | "opacity"
  | "path"
  | "r"
  | "rotate"
  | "src"
  | "stroke"
  | "strokeOpacity"
  | "strokeWidth"
  | "symbol"
  | "text"
  | "title"
  | "weight"
  | "width"
  | "x"
  | "x1"
  | "x2"
  | "y"
  | "y1"
  | "y2"
  | "z";

export type Channels = {[key in ChannelName]?: Channel};

export interface Channel {
  value: ChannelValueSpec | null;
  scale?: ScaleName | "auto" | boolean;
  type?: ScaleType;
  optional?: boolean;
  filter?: (value: any) => boolean;
  hint?: any; // TODO
}

export type ChannelValue =
  | Iterable<any> // column of values
  | string // field or literal color
  | Date // constant
  | number // constant
  | boolean // constant
  | null // constant
  | ((d: any, i: number) => any) // function of data
  | ChannelTransform; // function of data

export type ChannelValueSpec = ChannelValue | Pick<Channel, "value" | "scale">;

export type ChannelDomainValue = ChannelName | "data" | "width" | "height" | null;

export interface ChannelDomainOptions {
  reduce?: Reducer;
  reverse?: boolean;
  limit?: number;
}

export type ChannelDomainSort = {
  [key in ScaleName]?:
    | ChannelDomainValue
    | ({
        value: ChannelDomainValue;
      } & ChannelDomainOptions);
} & ChannelDomainOptions;

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

export type ReducerFunction = (values: any[], extent: {x1: any; y1: any; x2: any; y2: any}) => any; // TODO extent only for bin

export interface ReducerImplementation {
  reduce(index: number[], values: any[], extent: {x1: any; y1: any; x2: any; y2: any}): any; // TODO extent only for bin
}

export type Reducer = ReducerName | ReducerFunction | ReducerImplementation;

export type ChannelReducers = {[key in ChannelName]?: Reducer | null}; // TODO ChannelReducerSpec {reducer, scale}
