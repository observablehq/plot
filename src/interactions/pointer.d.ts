import type {ChannelValue, ChannelValueSpec} from "../channel.js";
import type {Rendered} from "../transforms/basic.js";

/** TODO */
export interface PointerOptions {
  /** TODO */
  maxRadius?: number;

  /** TODO */
  x?: ChannelValueSpec;

  /** TODO */
  y?: ChannelValueSpec;

  /** TODO */
  px?: ChannelValue;

  /** TODO */
  py?: ChannelValue;
}

/** TODO */
export function pointer<T>(options: T & PointerOptions): Rendered<T>;

/** TODO */
export function pointerX<T>(options: T & PointerOptions): Rendered<T>;

/** TODO */
export function pointerY<T>(options: T & PointerOptions): Rendered<T>;
