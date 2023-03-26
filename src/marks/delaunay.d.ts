import type {ChannelValue, ChannelValueSpec} from "../channel.js";
import type {CurveOptions} from "../curve.js";
import type {Data, MarkOptions, RenderableMark} from "../mark.js";
import type {MarkerOptions} from "../marker.js";

/** Options for the Delaunay marks. */
export interface DelaunayOptions extends MarkOptions, MarkerOptions, CurveOptions {
  /** A channel for the horizontal position, typically bound to the *x* scale.  */
  x?: ChannelValueSpec;
  /** A channel for the vertical position, typically bound to the *y* scale.  */
  y?: ChannelValueSpec;
  /** Groups points into series, constructing a mark for each group. */
  z?: ChannelValue;
}

/**
 * Draws links for each edge of the Delaunay triangulation of the *data* points
 * given by the **x** and **y** channels. Supports the same options as the
 * **link**, except that **x1**, **y1**, **x2**, and **y2** are derived
 * automatically from **x** and **y**. When an aesthetic channel is specified
 * (such as **stroke** or **strokeWidth**), the link inherits the corresponding
 * channel value from one of its two endpoints arbitrarily.
 *
 * If a **z** channel is specified, the input points are grouped by *z*, and
 * separate Delaunay triangulations are constructed for each group.
 */
export function delaunayLink(data?: Data, options?: DelaunayOptions): RenderableMark;

/**
 * Draws a mesh of the Delaunay triangulation of the points given by the **x**
 * and **y** channels. The **stroke** option defaults to _currentColor_, and the
 * **strokeOpacity** defaults to 0.2. The **fill** option is not supported. When
 * an aesthetic channel is specified (such as **stroke** or **strokeWidth**),
 * the mesh inherits the corresponding channel value from one of its constituent
 * points arbitrarily.
 *
 * If a **z** channel is specified, the input points are grouped by *z*, and
 * separate Delaunay triangulations are constructed for each group.
 */
export function delaunayMesh(data?: Data, options?: DelaunayOptions): RenderableMark;

/**
 * Draws a convex hull around the points given by the **x** and **y** channels.
 * The **stroke** option defaults to _currentColor_ and the **fill** option
 * defaults to _none_. When an aesthetic channel is specified (such as
 * **stroke** or **strokeWidth**), the hull inherits the corresponding channel
 * value from one of its constituent points arbitrarily.
 *
 * If a **z** channel is specified, the input points are grouped by *z*, and
 * separate convex hulls are constructed for each group. If the **z** channel is
 * not specified, it defaults to either the **fill** channel, if any, or the
 * **stroke** channel, if any.
 */
export function hull(data?: Data, options?: DelaunayOptions): RenderableMark;

/**
 * Draws polygons for each cell of the Voronoi tesselation of the points given
 * by the **x** and **y** channels.
 *
 * If a **z** channel is specified, the input points are grouped by *z*, and
 * separate Voronoi tesselations are constructed for each group.
 */
export function voronoi(data?: Data, options?: DelaunayOptions): RenderableMark;

/**
 * Draws a mesh for the cell boundaries of the Voronoi tesselation of the points
 * given by the **x** and **y** channels. The **stroke** option defaults to
 * _currentColor_, and the **strokeOpacity** defaults to 0.2. The **fill**
 * option is not supported. When an aesthetic channel is specified (such as
 * **stroke** or **strokeWidth**), the mesh inherits the corresponding channel
 * value from one of its constituent points arbitrarily.
 *
 * If a **z** channel is specified, the input points are grouped by *z*, and
 * separate Voronoi tesselations are constructed for each group.
 */
export function voronoiMesh(data?: Data, options?: DelaunayOptions): RenderableMark;
