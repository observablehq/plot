import type {FrameAnchor} from "../options.js";
import type {ChannelValueSpec} from "../channel.js";
import type {Data, MarkOptions, RenderableMark} from "../mark.js";
import type {SymbolImplementation, SymbolName} from "../symbols.js";

export interface DotOptions extends MarkOptions {
  x?: ChannelValueSpec;
  y?: ChannelValueSpec;
  r?: ChannelValueSpec | number;
  rotate?: ChannelValueSpec | number;
  symbol?: ChannelValueSpec | SymbolName | SymbolImplementation;
  frameAnchor?: FrameAnchor;
}

export function dot(data?: Data, options?: DotOptions): Dot;

export function dotX(data?: Data, options?: DotOptions): Dot;

export function dotY(data?: Data, options?: DotOptions): Dot;

export function circle(data?: Data, options?: Exclude<DotOptions, "symbol">): Dot;

export function hexagon(data?: Data, options?: Exclude<DotOptions, "symbol">): Dot;

export class Dot extends RenderableMark {}
