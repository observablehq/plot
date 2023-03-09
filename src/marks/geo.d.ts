import type {GeoPermissibleObjects} from "d3";
import type {ChannelValueSpec} from "../channel.js";
import type {Data, MarkOptions, RenderableMark} from "../mark.js";

export interface GeoOptions extends MarkOptions {
  geometry?: ChannelValueSpec;
  r?: ChannelValueSpec;
}

export function geo(data?: Data | GeoPermissibleObjects, options?: GeoOptions): Geo;

export function sphere(options?: GeoOptions): Geo;

export function graticule(options?: GeoOptions): Geo;

export class Geo extends RenderableMark {}
