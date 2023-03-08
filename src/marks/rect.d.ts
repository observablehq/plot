import type {Data, MarkOptions, RenderableMark} from "../mark.js";

export interface RectOptions extends MarkOptions {
  inset?: number;
  insetTop?: number;
  insetRight?: number;
  insetBottom?: number;
  insetLeft?: number;
  rx?: number | string;
  ry?: number | string;
}

export function rect(data?: Data | null, options?: RectOptions): Rect;

export function rectX(data?: Data | null, options?: RectOptions): Rect;

export function rectY(data?: Data | null, options?: RectOptions): Rect;

export class Rect extends RenderableMark {}
