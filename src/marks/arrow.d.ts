import type {Data, MarkOptions, RenderableMark} from "../mark.js";

export interface ArrowOptions extends MarkOptions {
  // TODO
}

export function arrow(data?: Data, options?: ArrowOptions): Arrow;

export class Arrow extends RenderableMark {}
