import type {ChannelValueSpec} from "../channel.js";
import type {CompoundMark, Data, MarkOptions, RenderableMark} from "../mark.js";
import type {ScaleOptions} from "../scales.js";

export interface AxisOptions extends MarkOptions {
  x?: ChannelValueSpec;
  y?: ChannelValueSpec;
  anchor?: "top" | "right" | "bottom" | "left";
  interval?: ScaleOptions["interval"];
  ticks?: ScaleOptions["ticks"];
  tickSize?: ScaleOptions["tickSize"];
  tickSpacing?: ScaleOptions["tickSpacing"];
  tickPadding?: ScaleOptions["tickPadding"];
  tickFormat?: ScaleOptions["tickFormat"];
  tickRotate?: ScaleOptions["tickRotate"];
  grid?: ScaleOptions["grid"];
  line?: ScaleOptions["line"];
  label?: ScaleOptions["label"];
  labelOffset?: ScaleOptions["labelOffset"];
  labelAnchor?: ScaleOptions["labelAnchor"];
  fontVariant?: ScaleOptions["fontVariant"];
  inset?: number;
  insetTop?: number;
  insetRight?: number;
  insetBottom?: number;
  insetLeft?: number;
  textStroke?: string;
}

export type GridOptions = AxisOptions; // TODO

export function axisY(options?: AxisOptions): CompoundMark;
export function axisY(data?: Data, options?: AxisOptions): CompoundMark;

export function axisFy(options?: AxisOptions): CompoundMark;
export function axisFy(data?: Data, options?: AxisOptions): CompoundMark;

export function axisX(options?: AxisOptions): CompoundMark;
export function axisX(data?: Data, options?: AxisOptions): CompoundMark;

export function axisFx(options?: AxisOptions): CompoundMark;
export function axisFx(data?: Data, options?: AxisOptions): CompoundMark;

export function gridY(options?: GridOptions): RenderableMark;
export function gridY(data?: Data, options?: GridOptions): RenderableMark;

export function gridFy(options?: GridOptions): RenderableMark;
export function gridFy(data?: Data, options?: GridOptions): RenderableMark;

export function gridX(options?: GridOptions): RenderableMark;
export function gridX(data?: Data, options?: GridOptions): RenderableMark;

export function gridFx(options?: GridOptions): RenderableMark;
export function gridFx(data?: Data, options?: GridOptions): RenderableMark;
