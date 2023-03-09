import type {ScaleType} from "./scales.js";

export interface ChannelTransform {
  transform: (data: any[]) => any[];
}

export interface ChannelSpec {
  value: ChannelValueSpec | null;
  scale?: string | boolean; // TODO scale name
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

export type ChannelReduce = any; // TODO

export type ChannelDomainSort = {
  reduce?: ChannelReduce;
  reverse?: boolean;
  limit?: number;
} & {
  [name: string]:
    | string // value
    | {
        value: string; // channel name, "data", "width", "height"
        reduce?: ChannelReduce;
        reverse?: boolean;
        limit?: number;
      };
};
