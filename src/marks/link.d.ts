import type {Data, MarkOptions, RenderableMark} from "../mark.js";

export interface LinkOptions extends MarkOptions {
  // TODO
}

export function link(data?: Data | null, options?: LinkOptions): Link;

export class Link extends RenderableMark {}
