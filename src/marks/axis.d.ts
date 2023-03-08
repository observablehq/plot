import type {CompoundMark, Data, MarkOptions, RenderableMark} from "mark.js";

export interface AxisOptions extends MarkOptions {
  // TODO
}

export interface GridOptions extends MarkOptions {
  // TODO
}

export function axisY(options?: AxisOptions): CompoundMark;
export function axisY(data?: Data | null, options?: AxisOptions): CompoundMark;

export function axisFy(options?: AxisOptions): CompoundMark;
export function axisFy(data?: Data | null, options?: AxisOptions): CompoundMark;

export function axisX(options?: AxisOptions): CompoundMark;
export function axisX(data?: Data | null, options?: AxisOptions): CompoundMark;

export function axisFx(options?: AxisOptions): CompoundMark;
export function axisFx(data?: Data | null, options?: AxisOptions): CompoundMark;

export function gridY(options?: GridOptions): RenderableMark;
export function gridY(data?: Data | null, options?: GridOptions): RenderableMark;

export function gridFy(options?: GridOptions): RenderableMark;
export function gridFy(data?: Data | null, options?: GridOptions): RenderableMark;

export function gridX(options?: GridOptions): RenderableMark;
export function gridX(data?: Data | null, options?: GridOptions): RenderableMark;

export function gridFx(options?: GridOptions): RenderableMark;
export function gridFx(data?: Data | null, options?: GridOptions): RenderableMark;
