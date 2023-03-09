import type {Data, MarkOptions, RenderableMark} from "../mark.js";

export interface GeoOptions extends MarkOptions {
  // TODO
}

export function geo(data?: Data, options?: GeoOptions): Geo;

export function sphere(options?: GeoOptions): Geo;

export function graticule(options?: GeoOptions): Geo;

export class Geo extends RenderableMark {}
