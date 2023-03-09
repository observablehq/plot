import type {CurveSpec} from "../curve.js";
import type {Data, MarkOptions, RenderableMark} from "../mark.js";

export interface LinkOptions extends MarkOptions {
  // TODO
  curve?: CurveSpec | "auto";
}

export function link(data?: Data, options?: LinkOptions): Link;

export class Link extends RenderableMark {}
