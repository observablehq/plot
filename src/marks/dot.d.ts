import type {Data, MarkOptions, RenderableMark} from "../mark.js";

export interface DotOptions extends MarkOptions {
  // TODO
}

export function dot(data?: Data | null, options?: DotOptions): Dot;

export function dotX(data?: Data | null, options?: DotOptions): Dot;

export function dotY(data?: Data | null, options?: DotOptions): Dot;

export function circle(data?: Data | null, options?: DotOptions): Dot;

export function hexagon(data?: Data | null, options?: DotOptions): Dot;

export class Dot extends RenderableMark {}
