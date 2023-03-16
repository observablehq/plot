/** How to decorate control points. */
export type Marker =
  | "arrow"
  | "dot"
  | "circle"
  | "circle-fill"
  | "circle-stroke"
  | ((color: string, context: {document: Document}) => SVGMarkerElement);

export interface MarkerOptions {
  /**
   * Shorthand to set the same default for markerStart, markerMid, and
   * markerEnd. A marker may be specified as:
   *
   * * *none* (default) - no marker
   * * *arrow* - an arrowhead
   * * *dot* - a filled *circle* with no stroke and 2.5px radius
   * * *circle-fill* - a filled circle with a white stroke and 3px radius
   * * *circle-stroke* - a stroked circle with a white fill and 3px radius
   * * *circle* - alias for *circle-fill*
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
   * The marker for the starting point of a line segment. A marker may be
   * specified as:
   *
   * * *none* (default) - no marker
   * * *arrow* - an arrowhead
   * * *dot* - a filled *circle* with no stroke and 2.5px radius
   * * *circle-fill* - a filled circle with a white stroke and 3px radius
   * * *circle-stroke* - a stroked circle with a white fill and 3px radius
   * * *circle* - alias for *circle-fill*
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
   * segment only has a start and end point, this option has no effect. A marker
   * may be specified as:
   *
   * * *none* (default) - no marker
   * * *arrow* - an arrowhead
   * * *dot* - a filled *circle* with no stroke and 2.5px radius
   * * *circle-fill* - a filled circle with a white stroke and 3px radius
   * * *circle-stroke* - a stroked circle with a white fill and 3px radius
   * * *circle* - alias for *circle-fill*
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
   * The marker for the ending point of a line segment. A marker may be
   * specified as:
   *
   * * *none* (default) - no marker
   * * *arrow* - an arrowhead
   * * *dot* - a filled *circle* with no stroke and 2.5px radius
   * * *circle-fill* - a filled circle with a white stroke and 3px radius
   * * *circle-stroke* - a stroked circle with a white fill and 3px radius
   * * *circle* - alias for *circle-fill*
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
