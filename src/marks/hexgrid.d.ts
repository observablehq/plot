import type {MarkOptions, RenderableMark} from "../mark.js";

/** Options for the hexgrid mark. */
export interface HexgridOptions extends MarkOptions {
  /**
   * The distance between centers of neighboring hexagons, in pixels; defaults
   * to 20. Should match the **binWidth** of the hexbin transform.
   */
  binWidth?: number;
}

/**
 * The hexgrid decoration mark complements the hexbin transform, showing the
 * outlines of all hexagons spanning the frame with a default **stroke** of
 * *currentColor* and a default **strokeOpacity** of 0.1, similar to the the
 * default axis grids. For example:
 *
 * ```js
 * Plot.plot({
 *   marks: [
 *     Plot.hexagon(Plot.hexbin({fill: "count"}, {binWidth: 12, x: "weight", y: "economy"})),
 *     Plot.hexgrid({binWidth: 12})
 *   ]
 * })
 * ```
 *
 * Note that the **binWidth** option of the hexgrid mark should match that of
 * the hexbin transform. The grid is clipped by the frame. This is a stroke-only
 * mark, and **fill** is not supported; to fill the frame, use the frame mark.
 */
export function hexgrid(options?: HexgridOptions): Hexgrid;

/** The hexgrid mark. */
export class Hexgrid extends RenderableMark {}
