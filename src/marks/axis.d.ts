import type {CompoundMark, Data, MarkOptions, RenderableMark} from "../mark.js";
import type {ScaleOptions} from "../scales.js";
import type {RuleXOptions, RuleYOptions} from "./rule.js";
import type {TextOptions} from "./text.js";
import type {TickXOptions, TickYOptions} from "./tick.js";

export type AxisAnchor = "top" | "right" | "bottom" | "left";

interface GridOptions {
  anchor?: AxisAnchor;
  interval?: ScaleOptions["interval"];
  ticks?: ScaleOptions["ticks"];
  tickSpacing?: ScaleOptions["tickSpacing"];
  color?: MarkOptions["stroke"];
}

interface AxisOptions extends GridOptions, MarkOptions, TextOptions {
  tickSize?: ScaleOptions["tickSize"];
  tickPadding?: ScaleOptions["tickPadding"];
  tickFormat?: ScaleOptions["tickFormat"];
  tickRotate?: ScaleOptions["tickRotate"];
  grid?: ScaleOptions["grid"];
  line?: ScaleOptions["line"];
  label?: ScaleOptions["label"];
  labelOffset?: ScaleOptions["labelOffset"];
  labelAnchor?: ScaleOptions["labelAnchor"];
  textStroke?: MarkOptions["stroke"];
  textStrokeOpacity?: MarkOptions["strokeOpacity"];
  textStrokeWidth?: MarkOptions["strokeWidth"];
}

export interface AxisXOptions extends AxisOptions, TickXOptions {}

export interface AxisYOptions extends AxisOptions, TickYOptions {}

export interface GridXOptions extends GridOptions, Omit<RuleXOptions, "interval"> {}

export interface GridYOptions extends GridOptions, Omit<RuleYOptions, "interval"> {}

export function axisY(options?: AxisYOptions): CompoundMark;

export function axisY(data?: Data, options?: AxisYOptions): CompoundMark;

export function axisFy(options?: AxisYOptions): CompoundMark;

export function axisFy(data?: Data, options?: AxisYOptions): CompoundMark;

export function axisX(options?: AxisXOptions): CompoundMark;

export function axisX(data?: Data, options?: AxisXOptions): CompoundMark;

export function axisFx(options?: AxisXOptions): CompoundMark;

export function axisFx(data?: Data, options?: AxisXOptions): CompoundMark;

export function gridY(options?: GridYOptions): RenderableMark;

export function gridY(data?: Data, options?: GridYOptions): RenderableMark;

export function gridFy(options?: GridYOptions): RenderableMark;

export function gridFy(data?: Data, options?: GridYOptions): RenderableMark;

export function gridX(options?: GridXOptions): RenderableMark;

export function gridX(data?: Data, options?: GridXOptions): RenderableMark;

export function gridFx(options?: GridXOptions): RenderableMark;

export function gridFx(data?: Data, options?: GridXOptions): RenderableMark;
