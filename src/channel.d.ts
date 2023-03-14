import type {Interval} from "./interval.js";
import type {Reducer} from "./reducer.js";
import type {ScaleName, ScaleType} from "./scales.js";

export interface ChannelTransform {
  transform: (data: any[]) => any[];
}

export type ChannelName =
  | "ariaLabel"
  | "fill"
  | "fillOpacity"
  | "fontSize"
  | "fx"
  | "fy"
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
  | (string & Record<never, never>) // field or literal color; see also https://github.com/microsoft/TypeScript/issues/29729
  | Date // constant
  | number // constant
  | boolean // constant
  | null // constant
  | ((d: any, i: number) => any) // function of data
  | ChannelTransform; // function of data

export type ChannelValueSpec = ChannelValue | {value: ChannelValue; scale?: Channel["scale"]}; // TODO label

export type ChannelValueIntervalSpec = ChannelValueSpec | {value: ChannelValue; interval?: Interval}; // TODO scale override?

export type ChannelReducerSpec = Reducer | {reduce: Reducer; scale?: Channel["scale"]};

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

export type ChannelReducers = {[key in ChannelName]?: ChannelReducerSpec | null};

/** The abstract (unscaled) values, and associated scale, per channel. */
export type ChannelStates = {[key in ChannelName]?: {value: any[]; scale: ScaleName | null}};

/** The possibly-scaled values for each channel. */
export type ChannelValues = {[key in ChannelName]?: any[]} & {channels: ChannelStates};
