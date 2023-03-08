import type {ChannelValueSpec, Data, Mark, MarkOptions} from "../mark.js";

export interface BarOptions extends MarkOptions {
  inset?: number;
  insetTop?: number;
  insetRight?: number;
  insetBottom?: number;
  insetLeft?: number;
  rx?: number | string;
  ry?: number | string;
}

export interface BarXOptions extends BarOptions {
  x1?: ChannelValueSpec;
  x2?: ChannelValueSpec;
  y?: ChannelValueSpec;
}

export interface BarYOptions extends BarOptions {
  y1?: ChannelValueSpec;
  y2?: ChannelValueSpec;
  x?: ChannelValueSpec;
}

/** @jsdoc barX */
export function barX(data?: Data | null, options?: BarXOptions): BarX;

/** @jsdoc barY */
export function barY(data?: Data | null, options?: BarYOptions): BarY;

/** @jsdoc BarX */
export class BarX extends Mark {}

/** @jsdoc BarY */
export class BarY extends Mark {}
