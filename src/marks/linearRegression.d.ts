import type {Data, MarkOptions, RenderableMark} from "../mark.js";

export interface LinearRegressionOptions extends MarkOptions {
  // TODO
}

export function linearRegressionX(data?: Data | null, options?: LinearRegressionOptions): RenderableMark;

export function linearRegressionY(data?: Data | null, options?: LinearRegressionOptions): RenderableMark;
