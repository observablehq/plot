import type {InsetOptions} from "../inset.js";
import type {MarkOptions, RenderableMark} from "../mark.js";

export interface FrameOptions extends MarkOptions, InsetOptions {
  anchor?: "top" | "right" | "bottom" | "left" | null;
  rx?: number | string;
  ry?: number | string;
}

export function frame(options?: FrameOptions): Frame;

export class Frame extends RenderableMark {}
