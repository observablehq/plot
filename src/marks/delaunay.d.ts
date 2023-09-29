import type {ChannelValue, ChannelValueSpec} from "../channel.js";
import type {CurveOptions} from "../curve.js";
import type {Data, MarkOptions, RenderableMark} from "../mark.js";
import type {MarkerOptions} from "../marker.js";

/** Options for the Delaunay marks. */
export interface DelaunayOptions extends MarkOptions, MarkerOptions, CurveOptions {
  /** The horizontal position channel, typically bound to the *x* scale. */
  x?: ChannelValueSpec;
  /** The vertical position channel, typically bound to the *y* scale. */
  y?: ChannelValueSpec;
  /** An optional ordinal channel for grouping to produce multiple (possibly overlapping) triangulations. */
  z?: ChannelValue;
}

/**
 * Returns a mark that draws links for each edge of the Delaunay triangulation
 * of the points given by the **x** and **y** channels. Like the link mark,
 * except that **x1**, **y1**, **x2**, and **y2** are derived automatically from
 * **x** and **y**. When an aesthetic channel is specified (such as **stroke**
 * or **strokeWidth**), the link inherits the corresponding channel value from
 * one of its two endpoints arbitrarily.
 *
 * If **z** is specified, the input points are grouped by *z*, producing a
 * separate Delaunay triangulation for each group.
 */
export function delaunayLink(data?: Data, options?: DelaunayOptions): RenderableMark;

/**
 * Returns a mark that draws a mesh of the Delaunay triangulation of the points
 * given by the **x** and **y** channels. The **stroke** option defaults to
 * _currentColor_, and the **strokeOpacity** defaults to 0.2; the **fill**
 * option is not supported. When an aesthetic channel is specified (such as
 * **stroke** or **strokeWidth**), the mesh inherits the corresponding channel
 * value from one of its constituent points arbitrarily.
 *
 * If **z** is specified, the input points are grouped by *z*, producing a
 * separate Delaunay triangulation for each group.
 */
export function delaunayMesh(data?: Data, options?: DelaunayOptions): RenderableMark;

/**
 * Returns a mark that draws a convex hull around the points given by the **x**
 * and **y** channels. The **stroke** option defaults to _currentColor_ and the
 * **fill** option defaults to _none_. When an aesthetic channel is specified
 * (such as **stroke** or **strokeWidth**), the hull inherits the corresponding
 * channel value from one of its constituent points arbitrarily.
 *
 * If **z** is specified, the input points are grouped by *z*, producing a
 * separate hull for each group. If **z** is not specified, it defaults to the
 * **fill** channel, if any, or the **stroke** channel, if any.
 */
export function hull(data?: Data, options?: DelaunayOptions): RenderableMark;

/**
 * Returns a mark that draws polygons for each cell of the Voronoi tesselation
 * of the points given by the **x** and **y** channels.
 *
 * If **z** is specified, the input points are grouped by *z*, producing a
 * separate Voronoi tesselation for each group.
 */
export function voronoi(data?: Data, options?: DelaunayOptions): RenderableMark;

/**
 * Returns a mark that draws a mesh for the cell boundaries of the Voronoi
 * tesselation of the points given by the **x** and **y** channels. The
 * **stroke** option defaults to _currentColor_, and the **strokeOpacity**
 * defaults to 0.2. The **fill** option is not supported. When an aesthetic
 * channel is specified (such as **stroke** or **strokeWidth**), the mesh
 * inherits the corresponding channel value from one of its constituent points
 * arbitrarily.
 *
 * If **z** is specified, the input points are grouped by *z*, producing a
 * separate Voronoi tesselation for each group.
 */
export function voronoiMesh(data?: Data, options?: DelaunayOptions): RenderableMark;
