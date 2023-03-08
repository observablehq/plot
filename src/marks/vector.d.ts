import type {Data, MarkOptions, RenderableMark} from "../mark.js";

export interface VectorOptions extends MarkOptions {
  // TODO
}

export function vector(data?: Data | null, options?: VectorOptions): Vector;

export function vectorX(data?: Data | null, options?: VectorOptions): Vector;

export function vectorY(data?: Data | null, options?: VectorOptions): Vector;

export function spike(data?: Data | null, options?: VectorOptions): Vector;

export class Vector extends RenderableMark {}
