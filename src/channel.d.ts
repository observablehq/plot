export interface ChannelTransform {
  transform: (data: any[]) => any[];
}

export interface ChannelSpec {
  value: ChannelValueSpec | null;
  scale?: string | null; // TODO scale name
  type?: string; // TODO scale type requirement (e.g., "band")
  optional?: boolean;
  filter?: (value: any) => boolean;
  hint?: any; // TODO
}

export type ChannelValue =
  | any[] // TODO iterable, typed array?
  | string // field name, or literal color
  | Date // constant
  | number // constant
  | boolean // constant
  | null // constant
  | ((d: any, i: number) => any) // function of data
  | ChannelTransform; // function of data

export type ChannelValueSpec = ChannelValue | {value: ChannelValue; scale?: string | boolean | null};

export type ChannelDomainSort = {
  [name: string]:
    | string // channel name, "data", "width", "height"
    | {
        value: string; // channel name, "data", "width", "height"
        reverse?: boolean;
        reduce?: any; // TODO
        limit?: number;
      };
  reverse?: boolean;
  reduce?: any; // TODO
  limit?: number;
};
