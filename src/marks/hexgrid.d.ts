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
 */
export function hexgrid(options?: HexgridOptions): Hexgrid;

/** The hexgrid mark. */
export class Hexgrid extends RenderableMark {}
