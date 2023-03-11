import type {ChannelValue, ChannelValueSpec} from "../channel.js";
import type {CurveOptions} from "../curve.js";
import type {Data, MarkOptions, RenderableMark} from "../mark.js";
import type {MarkerOptions} from "../marker.js";

export interface DelaunayOptions extends MarkOptions, MarkerOptions, CurveOptions {
  x?: ChannelValueSpec;
  y?: ChannelValueSpec;
  z?: ChannelValue;
}

export function delaunayLink(data?: Data, options?: DelaunayOptions): RenderableMark;

export function delaunayMesh(data?: Data, options?: DelaunayOptions): RenderableMark;

export function hull(data?: Data, options?: DelaunayOptions): RenderableMark;

export function voronoi(data?: Data, options?: DelaunayOptions): RenderableMark;

export function voronoiMesh(data?: Data, options?: DelaunayOptions): RenderableMark;
