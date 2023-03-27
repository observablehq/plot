import type {MarkOptions, RenderableMark} from "../mark.js";

/** Options for the hexgrid mark. */
export interface HexgridOptions extends MarkOptions {
  /**
   * The distance between centers of neighboring hexagons, in pixels; defaults
   * to 20. Should reflect the binWidth of the **hexbin** transform.
   */
  binWidth?: number;
}

/**
 * The hexgrid mark can be used to support marks using the **hexbin** transform.
 * Its default **stroke** (currentColor) and strokeOpacity (0.1) are similar to
 * the **grid** mark’s defaults. To create a hexagonal grid, associated with a
 * binning, use the same **binWidth**:
 *
 * ```js
 * Plot.plot({marks: [
 *   Plot.hexagon(Plot.hexbin({fill: "count"}, {binWidth: 12, x: "weight", y: "economy"})),
 *   Plot.hexgrid({binWidth: 12})
 * ]})
 * ```
 *
 * The hexagons span the entire frame—encompassing in particular empty hexagons
 * that the **hexbin** transform does not generate. The grid is clipped by the
 * frame. This is a stroke-only mark, and fill color is not supported: use the
 * **frame** mark with the **fill** option instead.
 */
export function hexgrid(options?: HexgridOptions): Hexgrid;

/** The hexgrid mark. */
export class Hexgrid extends RenderableMark {}
