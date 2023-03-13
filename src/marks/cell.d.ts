import type {ChannelValueSpec} from "../channel.js";
import type {InsetOptions} from "../inset.js";
import type {Data, MarkOptions, RenderableMark} from "../mark.js";

export interface CellOptions extends MarkOptions, InsetOptions {
  x?: ChannelValueSpec;
  y?: ChannelValueSpec;
  rx?: number | string;
  ry?: number | string;
}

export function cell(data?: Data, options?: CellOptions): Cell;

export function cellX(data?: Data, options?: CellOptions): Cell;

export function cellY(data?: Data, options?: CellOptions): Cell;

export class Cell extends RenderableMark {}
