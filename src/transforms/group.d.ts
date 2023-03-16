import type {ChannelReducers} from "../channel.js";
import type {Reducer} from "../reducer.js";
import type {Transformed} from "./basic.js";

export interface GroupOutputOptions {
  data?: Reducer | null;
  filter?: Reducer | null;
  sort?: Reducer | null;
  reverse?: boolean;
}

export type GroupOutputs = ChannelReducers & GroupOutputOptions;

export function groupZ<T>(outputs?: GroupOutputs, options?: T): Transformed<T>;

export function groupX<T>(outputs?: GroupOutputs, options?: T): Transformed<T>;

export function groupY<T>(outputs?: GroupOutputs, options?: T): Transformed<T>;

export function group<T>(outputs?: GroupOutputs, options?: T): Transformed<T>;
