/** Options for insetting rectangular shapes. */
export interface InsetOptions {
  /**
   * Shorthand to set the same default for all four insets: **insetTop**,
   * **insetRight**, **insetBottom**, and **insetLeft**. All insets typically
   * default to zero, though not always (say when using bin transform). A
   * positive inset reduces effective area, while a negative inset increases it.
   */
  inset?: number;

  /**
   * Insets the top edge by the specified number of pixels. A positive value
   * insets towards the bottom edge (reducing effective area), while a negative
   * value insets away from the bottom edge (increasing it).
   */
  insetTop?: number;

  /**
   * Insets the right edge by the specified number of pixels. A positive value
   * insets towards the left edge (reducing effective area), while a negative
   * value insets away from the left edge (increasing it).
   */
  insetRight?: number;

  /**
   * Insets the bottom edge by the specified number of pixels. A positive value
   * insets towards the top edge (reducing effective area), while a negative
   * value insets away from the top edge (increasing it).
   */
  insetBottom?: number;

  /**
   * Insets the left edge by the specified number of pixels. A positive value
   * insets towards the right edge (reducing effective area), while a negative
   * value insets away from the right edge (increasing it).
   */
  insetLeft?: number;
}
