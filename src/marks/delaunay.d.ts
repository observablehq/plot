import type {Data, MarkOptions, RenderableMark} from "../mark.js";

export interface DelaunayOptions extends MarkOptions {
  // TODO
}

export function delaunayLink(data?: Data, options?: DelaunayOptions): RenderableMark;

export function delaunayMesh(data?: Data, options?: DelaunayOptions): RenderableMark;

export function hull(data?: Data, options?: DelaunayOptions): RenderableMark;

export function voronoi(data?: Data, options?: DelaunayOptions): RenderableMark;

export function voronoiMesh(data?: Data, options?: DelaunayOptions): RenderableMark;
