import type {Data, MarkOptions, RenderableMark} from "../mark.js";

export interface ImageOptions extends MarkOptions {
  // TODO
}

export function image(data?: Data | null, options?: ImageOptions): Image;

export class Image extends RenderableMark {}
