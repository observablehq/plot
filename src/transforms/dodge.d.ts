import type {ChannelValueSpec} from "../channel.js";
import type {Initialized} from "./basic.js";

export type DodgeAnchor = "top" | "right" | "bottom" | "left" | "middle";

export interface DodgeOptions {
  x?: ChannelValueSpec;
  y?: ChannelValueSpec;
  r?: ChannelValueSpec;
  anchor?: DodgeAnchor;
  padding?: number;
}

export function dodgeX<T>(options?: T & DodgeOptions): Initialized<T>;

export function dodgeX<T>(dodgeOptions?: DodgeOptions | DodgeAnchor, options?: T): Initialized<T>;

export function dodgeY<T>(options?: T & DodgeOptions): Initialized<T>;

export function dodgeY<T>(dodgeOptions?: DodgeOptions | DodgeAnchor, options?: T): Initialized<T>;
