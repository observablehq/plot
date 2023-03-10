import type {ChannelValueSpec} from "../channel.js";
import type {Data, RenderableMark} from "../mark.js";
import type {RectOptions} from "./rect.js";

export interface CellOptions extends RectOptions {
  x?: ChannelValueSpec;
  y?: ChannelValueSpec;
}

export function cell(data?: Data, options?: CellOptions): Cell;

export function cellX(data?: Data, options?: CellOptions): Cell;

export function cellY(data?: Data, options?: CellOptions): Cell;

export class Cell extends RenderableMark {}
