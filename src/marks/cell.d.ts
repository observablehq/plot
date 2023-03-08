import type {Data, RenderableMark} from "../mark.js";
import type {RectOptions} from "./rect.js";

export interface CellOptions extends RectOptions {
  // TODO
}

export function cell(data?: Data | null, options?: CellOptions): Cell;

export function cellX(data?: Data | null, options?: CellOptions): Cell;

export function cellY(data?: Data | null, options?: CellOptions): Cell;

export class Cell extends RenderableMark {}
