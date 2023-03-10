import type {ChannelValue, ChannelValueSpec} from "../channel.js";
import type {CurveSpec} from "../curve.js";
import type {Data, MarkOptions, RenderableMark} from "../mark.js";
import type {MarkerSpec} from "../marker.js";

export interface DelaunayOptions extends MarkOptions {
  x?: ChannelValueSpec;
  y?: ChannelValueSpec;
  z?: ChannelValue;
  curve?: CurveSpec;
  tension?: number;
  marker?: MarkerSpec;
  markerStart?: MarkerSpec;
  markerMid?: MarkerSpec;
  markerEnd?: MarkerSpec;
}

export function delaunayLink(data?: Data, options?: DelaunayOptions): RenderableMark;

export function delaunayMesh(data?: Data, options?: DelaunayOptions): RenderableMark;

export function hull(data?: Data, options?: DelaunayOptions): RenderableMark;

export function voronoi(data?: Data, options?: DelaunayOptions): RenderableMark;

export function voronoiMesh(data?: Data, options?: DelaunayOptions): RenderableMark;
