import type {GeoPath} from "d3";
import type {MarkOptions} from "./mark.js";
import type {Projection} from "./projection.js";

/** Additional rendering context provided to marks and initializers. */
export interface Context {
  /**
   * The current document. Defaults to window.document, but may be overridden
   * via plot options as when rendering plots in a headless environment.
   */
  document: Document;

  /** The current owner SVG element. */
  ownerSVGElement: SVGSVGElement;

  /** The Plot’s (typically generated) class name, for custom styles. */
  className: string;

  /** The current projection, if any. */
  projection?: Projection;

  /** A function to draw GeoJSON with the current projection, if any; otherwise, with the x and y scales. */
  path: () => GeoPath;

  /** The default clip for all marks. */
  clip?: MarkOptions["clip"];
}
