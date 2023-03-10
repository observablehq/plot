import type {ChannelValueSpec} from "../channel.js";
import type {MarkOptions} from "../mark.js";
import type {Initialized} from "./basic.js";

export type DodgeAnchor = "top" | "right" | "bottom" | "left" | "middle";

export interface DodgeOptions {
  x?: ChannelValueSpec;
  y?: ChannelValueSpec;
  r?: ChannelValueSpec;
  anchor?: DodgeAnchor;
  padding?: number;
}

export function dodgeX<T extends MarkOptions>(options?: T & DodgeOptions): Initialized<Omit<T, keyof DodgeOptions>>;

export function dodgeX<T extends MarkOptions>(
  dodgeOptions?: DodgeOptions | DodgeAnchor,
  options?: T & DodgeOptions
): Initialized<Omit<T, keyof DodgeOptions>>;

export function dodgeY<T extends MarkOptions>(options?: T & DodgeOptions): Initialized<Omit<T, keyof DodgeOptions>>;

export function dodgeY<T extends MarkOptions>(
  dodgeOptions?: DodgeOptions | DodgeAnchor,
  options?: T & DodgeOptions
): Initialized<Omit<T, keyof DodgeOptions>>;
