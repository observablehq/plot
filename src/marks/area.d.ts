import type {Data, MarkOptions, RenderableMark} from "../mark.js";

export interface AreaOptions extends MarkOptions {
  // TODO
}

export function area(data?: Data | null, options?: AreaOptions): Area;

export function areaX(data?: Data | null, options?: AreaOptions): Area;

export function areaY(data?: Data | null, options?: AreaOptions): Area;

export class Area extends RenderableMark {}
