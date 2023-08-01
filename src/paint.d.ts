import type {Context} from "./context.js";

/** TODO */
export interface Paint {
  /** TODO */
  paint(context: Context): void;
}

/** TODO */
export function linearGradient(): Paint;
