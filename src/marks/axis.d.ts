import type {CompoundMark, Data, MarkOptions, RenderableMark} from "../mark.js";
import type {ScaleOptions} from "../scales.js";
import type {RuleXOptions, RuleYOptions} from "./rule.js";
import type {TextOptions} from "./text.js";
import type {TickOptions} from "./tick.js";

export type AxisAnchor = "top" | "right" | "bottom" | "left";

export interface GridOptions {
  anchor?: AxisAnchor;
  interval?: ScaleOptions["interval"];
  ticks?: ScaleOptions["ticks"];
  tickSpacing?: ScaleOptions["tickSpacing"];
  color?: TickOptions["stroke"];
}

export interface AxisOptions extends GridOptions, MarkOptions, TextOptions, TickOptions {
  tickSize?: ScaleOptions["tickSize"];
  tickPadding?: ScaleOptions["tickPadding"];
  tickFormat?: ScaleOptions["tickFormat"];
  tickRotate?: ScaleOptions["tickRotate"];
  grid?: ScaleOptions["grid"];
  line?: ScaleOptions["line"];
  label?: ScaleOptions["label"];
  labelOffset?: ScaleOptions["labelOffset"];
  labelAnchor?: ScaleOptions["labelAnchor"];
  textStroke?: TextOptions["stroke"];
  textStrokeOpacity?: TextOptions["strokeOpacity"];
  textStrokeWidth?: TextOptions["strokeWidth"];
}

export interface GridXOptions extends GridOptions, RuleXOptions {}

export interface GridYOptions extends GridOptions, RuleYOptions {}

export function axisY(options?: AxisOptions): CompoundMark;

export function axisY(data?: Data, options?: AxisOptions): CompoundMark;

export function axisFy(options?: AxisOptions): CompoundMark;

export function axisFy(data?: Data, options?: AxisOptions): CompoundMark;

export function axisX(options?: AxisOptions): CompoundMark;

export function axisX(data?: Data, options?: AxisOptions): CompoundMark;

export function axisFx(options?: AxisOptions): CompoundMark;

export function axisFx(data?: Data, options?: AxisOptions): CompoundMark;

export function gridY(options?: GridYOptions): RenderableMark;

export function gridY(data?: Data, options?: GridYOptions): RenderableMark;

export function gridFy(options?: GridYOptions): RenderableMark;

export function gridFy(data?: Data, options?: GridYOptions): RenderableMark;

export function gridX(options?: GridXOptions): RenderableMark;

export function gridX(data?: Data, options?: GridXOptions): RenderableMark;

export function gridFx(options?: GridXOptions): RenderableMark;

export function gridFx(data?: Data, options?: GridXOptions): RenderableMark;
