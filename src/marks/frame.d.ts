import type {RenderableMark} from "../mark.js";
import type {RectOptions} from "./rect.js";

export interface FrameOptions extends RectOptions {
  anchor?: "top" | "right" | "bottom" | "left" | null;
}

export function frame(options?: FrameOptions): Frame;

export class Frame extends RenderableMark {}
