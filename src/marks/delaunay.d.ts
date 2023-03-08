import type {Data, MarkOptions, RenderableMark} from "../mark.js";

export interface DelaunayOptions extends MarkOptions {
  // TODO
}

export function delaunayLink(data?: Data | null, options?: DelaunayOptions): RenderableMark;

export function delaunayMesh(data?: Data | null, options?: DelaunayOptions): RenderableMark;

export function hull(data?: Data | null, options?: DelaunayOptions): RenderableMark;

export function voronoi(data?: Data | null, options?: DelaunayOptions): RenderableMark;

export function voronoiMesh(data?: Data | null, options?: DelaunayOptions): RenderableMark;
