import type {ChannelReducers} from "../channel.js";
import type {Reducer} from "../reducer.js";
import type {Transformed} from "./basic.js";

export interface GroupReducers {
  data?: Reducer | null;
  filter?: Reducer | null;
  sort?: Reducer | null;
  reverse?: boolean;
}

export function groupZ<T>(outputs?: ChannelReducers & GroupReducers, options?: T): Transformed<T>;

export function groupX<T>(outputs?: ChannelReducers & GroupReducers, options?: T): Transformed<T>;

export function groupY<T>(outputs?: ChannelReducers & GroupReducers, options?: T): Transformed<T>;

export function group<T>(outputs?: ChannelReducers & GroupReducers, options?: T): Transformed<T>;
