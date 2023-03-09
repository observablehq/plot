import type {Data, MarkOptions, RenderableMark} from "../mark.js";

export interface DensityOptions extends MarkOptions {
  // TODO
}

export function density(data?: Data, options?: DensityOptions): Density;

export class Density extends RenderableMark {}
