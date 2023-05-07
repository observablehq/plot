import type {Rendered} from "../transforms/basic.js";

/** TODO */
export interface PointerOptions {
  /** TODO */
  maxRadius?: number;
}

/** TODO */
export function pointer<T>(options: T & PointerOptions): Rendered<T>;

/** TODO */
export function pointerX<T>(options: T & PointerOptions): Rendered<T>;

/** TODO */
export function pointerY<T>(options: T & PointerOptions): Rendered<T>;
