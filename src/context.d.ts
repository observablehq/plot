import type {GeoStreamWrapper} from "d3";

/** Additional rendering context provided to marks and initializers. */
export interface Context {
  /**
   * The current document. Defaults to window.document, but may be overridden
   * via plot options as when rendering plots in a headless environment.
   */
  document: Document;

  /** The current projection, if any. */
  projection?: GeoStreamWrapper;
}
