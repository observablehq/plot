import type {Data, MarkOptions, RenderableMark} from "../mark.js";

export interface ContourOptions extends MarkOptions {
  // TODO
}

export function contour(options?: ContourOptions): Contour;
export function contour(data?: Data | null, options?: ContourOptions): Contour;

export class Contour extends RenderableMark {}
