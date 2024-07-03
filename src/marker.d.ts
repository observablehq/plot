/**
 * The built-in marker implementations; one of:
 *
 * - *arrow* - an arrowhead with *auto* orientation
 * - *arrow-reverse* - an arrowhead with *auto-start-reverse* orientation
 * - *dot* - a filled *circle* with no stroke and 2.5px radius
 * - *circle-fill* - a filled circle with a white stroke and 3px radius
 * - *circle-stroke* - a stroked circle with a white fill and 3px radius
 * - *circle* - alias for *circle-fill*
 * - *tick* - a small opposing line
 * - *tick-x* - a small horizontal line
 * - *tick-y* - a small vertical line
 */
export type MarkerName =
  | "arrow"
  | "arrow-reverse"
  | "dot"
  | "circle"
  | "circle-fill"
  | "circle-stroke"
  | "tick"
  | "tick-x"
  | "tick-y";

/** A custom marker implementation. */
export type MarkerFunction = (color: string, context: {document: Document}) => SVGMarkerElement;

/** How to decorate control points. */
export type Marker = MarkerName | MarkerFunction;

/** Options for marks that support markers, such as lines and links. */
export interface MarkerOptions {
  /**
   * Shorthand to set the same default for markerStart, markerMid, and
   * markerEnd; one of:
   *
   * - a marker name such as *arrow* or *circle*
   * - *none* (default) - no marker
   * * true - alias for *circle-fill*
   * * false or null - alias for *none*
   * * a function - a custom marker function; see below
   *
   * Custom marker functions are passed the current marker *color* and a
   * *context* including the current document; they must return an SVG marker
   * element.
   */
  marker?: Marker | "none" | boolean | null;

  /**
   * The marker for the starting point of a line segment; one of:
   *
   * - a marker name such as *arrow* or *circle*
   * * *none* (default) - no marker
   * * true - alias for *circle-fill*
   * * false or null - alias for *none*
   * * a function - a custom marker function; see below
   *
   * Custom marker functions are passed the current marker *color* and a
   * *context* including the current document; they must return an SVG marker
   * element.
   */
  markerStart?: Marker | "none" | boolean | null;

  /**
   * The marker for any middle (interior) points of a line segment. If the line
   * segment only has a start and end point, this option has no effect. One of:
   *
   * - a marker name such as *arrow* or *circle*
   * * *none* (default) - no marker
   * * true - alias for *circle-fill*
   * * false or null - alias for *none*
   * * a function - a custom marker function; see below
   *
   * Custom marker functions are passed the current marker *color* and a
   * *context* including the current document; they must return an SVG marker
   * element.
   */
  markerMid?: Marker | "none" | boolean | null;

  /**
   * The marker for the ending point of a line segment; one of:
   *
   * - a marker name such as *arrow* or *circle*
   * * *none* (default) - no marker
   * * true - alias for *circle-fill*
   * * false or null - alias for *none*
   * * a function - a custom marker function; see below
   *
   * Custom marker functions are passed the current marker *color* and a
   * *context* including the current document; they must return an SVG marker
   * element.
   */
  markerEnd?: Marker | "none" | boolean | null;
}
