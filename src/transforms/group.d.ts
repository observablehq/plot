import type {ChannelValueSpec, Reducer} from "../channel.js";

export type Reducers = {
  [key: string]: Reducer;
};

export type Outputs<T> = {
  [key in keyof T]: ChannelValueSpec;
};

export function groupZ<A, B extends Reducers>(outputs?: B, options?: A): Omit<A, keyof B> & Outputs<B>;

export function groupX<A, B extends Reducers>(outputs?: B, options?: A): Omit<A, keyof B> & Outputs<B>;

export function groupY<A, B extends Reducers>(outputs?: B, options?: A): Omit<A, keyof B> & Outputs<B>;

export function group<A, B extends Reducers>(outputs?: B, options?: A): Omit<A, keyof B> & Outputs<B>;
