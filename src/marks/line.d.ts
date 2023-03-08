import type {Data, MarkOptions, RenderableMark} from "../mark.js";

export interface LineOptions extends MarkOptions {
  // TODO
}

export function line(data?: Data | null, options?: LineOptions): Line;

export function lineX(data?: Data | null, options?: LineOptions): Line;

export function lineY(data?: Data | null, options?: LineOptions): Line;

export class Line extends RenderableMark {}
