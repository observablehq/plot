import type {ChannelValue, ChannelValueSpec} from "../channel.js";
import type {Data, FrameAnchor, MarkOptions, RenderableMark} from "../mark.js";

/** Options for the image mark. */
export interface ImageOptions extends MarkOptions {
  /** The horizontal position of the image; typically bound to the *x* scale. */
  x?: ChannelValueSpec;

  /** The vertical position of the image; typically bound to the *y* scale. */
  y?: ChannelValueSpec;

  /**
   * The image width (in pixels, default 16). Images with a nonpositive width or
   * height are not drawn. If a **width** is specified but not a **height**, or
   * *vice versa*, the one defaults to the other.
   */
  width?: ChannelValue;

  /**
   * The image height (in pixels, default 16). Images with a nonpositive width
   * or height are not drawn. If a **width** is specified but not a **height**,
   * or *vice versa*, the one defaults to the other.
   */
  height?: ChannelValue;

  /**
   * The URL (or relative path) of each image (required). If **src** is
   * specified as a string that starts with a dot, slash, or URL protocol
   * (*e.g.*, “https:”) it is assumed to be a constant; otherwise it is
   * interpreted as a channel.
   */
  src?: ChannelValue;

  /**
   * The image [aspect ratio][1]; defaults to “xMidYMid meet”.
   *
   * To crop the image instead of scaling it to fit, set **preserveAspectRatio**
   * to “xMidYMid slice”. The **imageRendering** option may be set to
   * *pixelated* to disable bilinear interpolation on enlarged images; however,
   * note that this is not supported in WebKit.
   *
   * [1]:
   * https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/preserveAspectRatio
   */
  preserveAspectRatio?: string;

  /**
   * The [cross-origin][1] behavior. See the [Plot.image notebook][2] for details.
   *
   * [1]: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/crossorigin
   * [2]: https://observablehq.com/@observablehq/plot-image
   */
  crossOrigin?: string;

  /**
   * Position of the image relative to the frame if any of **x** or **y** are
   * not specified.
   */
  frameAnchor?: FrameAnchor;

  /**
   * The [image-rendering attribute][1]; defaults to *auto* (bilinear). The
   * option may be set to *pixelated* to disable bilinear interpolation for a
   * sharper image; however, note that this is not supported in WebKit.
   *
   * [1]:
   * https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/image-rendering
   */
  imageRendering?: string;
}

/**
 * Draws images as in a scatterplot. For example, portraits of U.S. presidents
 * by date of inauguration and favorability:
 *
 * ```js
 * Plot.image(presidents, {x: "inauguration", y: "favorability", src: "portrait"})
 * ```
 *
 * The required **src** option specifies the URL (or relative path) of each
 * image. If **src** is specified as a string that starts with a dot, slash, or
 * URL protocol (*e.g.*, “https:”) it is assumed to be a constant; otherwise it
 * is interpreted as a channel.
 *
 * In addition to the standard mark options, the following optional channels are
 * supported:
 *
 * * **x** - the horizontal position
 * * **y** - the vertical position
 * * **width** - the image width (in pixels)
 * * **height** - the image height (in pixels)
 *
 * If either of the **x** or **y** channels are not specified, the corresponding
 * position is controlled by the **frameAnchor** option. If neither the **x**
 * nor **y** nor **frameAnchor** options are specified, *data* is assumed to be
 * an array of pairs [[*x₀*, *y₀*], [*x₁*, *y₁*], [*x₂*, *y₂*], …] such that
 * **x** = [*x₀*, *x₁*, *x₂*, …] and **y** = [*y₀*, *y₁*, *y₂*, …].
 *
 * The following image-specific constant options are also supported:
 * **preserveAspectRatio**, **crossOrigin**, and **imageRendering**.
 *
 * Images are drawn in input order, with the last data drawn on top. If sorting
 * is needed, say to mitigate overplotting, consider a [sort and reverse
 * transform](#transforms).
 */
export function image(data?: Data, options?: ImageOptions): Image;

/** The image mark. */
export class Image extends RenderableMark {}
