/** The realized screen dimensions, in pixels, of a plot. */
export interface Dimensions {
  /** The outer width of the plot in pixels, including margins. */
  width: number;
  /** The outer height of the plot in pixels, including margins. */
  height: number;
  /** The distance between the inner and outer top edges of the plot. */
  marginTop: number;
  /** The distance between the inner and outer right edges of the plot. */
  marginRight: number;
  /** The distance between the inner and outer bottom edges of the plot. */
  marginBottom: number;
  /** The distance between the inner and outer left edges of the plot. */
  marginLeft: number;
  /** The default margins of the facet axes, if any. */
  facet?: {
    /** The minimum top margin to reserve for facet axes. */
    marginTop: number;
    /** The minimum right margin to reserve for facet axes. */
    marginRight: number;
    /** The minimum bottom margin to reserve for facet axes. */
    marginBottom: number;
    /** The minimum left margin to reserve for facet axes. */
    marginLeft: number;
  };
}
