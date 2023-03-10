import type {ChannelOutputs, ChannelReducers, Reducer} from "../channel.js";
import type {MarkOptions} from "../mark.js";
import type {Transformed} from "./basic.js";

export interface GroupOutputs {
  data?: Reducer;
  filter?: Reducer;
  sort?: Reducer;
  reverse?: boolean;
}

export function groupZ<T extends MarkOptions, S extends ChannelReducers>(
  outputs?: S & GroupOutputs,
  options?: T
): Transformed<Omit<T, keyof (S & GroupOutputs)> & ChannelOutputs<Omit<S, keyof GroupOutputs>>>;

export function groupX<T extends MarkOptions, S extends ChannelReducers>(
  outputs?: S & GroupOutputs,
  options?: T
): Transformed<Omit<T, keyof (S & GroupOutputs)> & ChannelOutputs<Omit<S, keyof GroupOutputs>>>;

export function groupY<T extends MarkOptions, S extends ChannelReducers>(
  outputs?: S & GroupOutputs,
  options?: T
): Transformed<Omit<T, keyof (S & GroupOutputs)> & ChannelOutputs<Omit<S, keyof GroupOutputs>>>;

export function group<T extends MarkOptions, S extends ChannelReducers>(
  outputs?: S & GroupOutputs,
  options?: T
): Transformed<Omit<T, keyof (S & GroupOutputs)> & ChannelOutputs<Omit<S, keyof GroupOutputs>>>;
