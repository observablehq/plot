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

// TODO Adopt stricter Channel instead of ChannelSpec.
export type Channels = {[key in ChannelName]?: ChannelSpec};

export type ChannelValues = {[key in ChannelName]?: any[]};

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
  | string // field or literal color
  | Date // constant
  | number // constant
  | boolean // constant
  | null // constant
  | ((d: any, i: number) => any) // function of data
  | ChannelTransform; // function of data

export type ChannelValueSpec = ChannelValue | Pick<ChannelSpec, "value" | "scale">;

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

export type ReducerFunction = (values: any[], extent: [min: any, max: any]) => any;

export interface ReducerImplementation {
  reduce(index: number[], values: any[], extent: [min: any, max: any]): any;
}

export type Reducer = ReducerName | ReducerFunction | ReducerImplementation;

export type ChannelReducers = {[key in ChannelName]?: Reducer}; // TODO ChannelReducerSpec {reducer, scale}

export type ChannelInputs = {[key in ChannelName]?: ChannelValueSpec};

export type ChannelOutputs<T> = {[key in keyof T]: ChannelValueSpec};
