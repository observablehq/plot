import type {Context} from "./context.js";

/** TODO */
export interface Paint {
  /** TODO */
  paint(context: Context): string | null;
}

/** TODO */
export function linearGradient(): Paint;
