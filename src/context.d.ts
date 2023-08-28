import type {GeoStreamWrapper} from "d3";
import type {Channels} from "./channel.js";
import type {Mark, MarkOptions} from "./mark.js";

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
  projection?: GeoStreamWrapper;

  /** The default clip for all marks. */
  clip?: MarkOptions["clip"];

  /**
   * Returns the initialized state of the given mark, including its transformed
   * data, faceted index, and initialized channels. This advanced method can be
   * used to create derived marks that borrow channels from other marks; for
   * example, the tip option uses this to derive a pointered tip mark.
   */
  getMarkState: (mark: Mark) => {data: any[]; facets: number[][]; channels: Channels};
}
