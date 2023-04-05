import type {ChannelValue, ChannelValueSpec} from "../channel.js";
import type {Data, FrameAnchor, MarkOptions, RenderableMark} from "../mark.js";

/** Options for the image mark. */
export interface ImageOptions extends MarkOptions {
  /**
   * The horizontal position channel specifying the image’s center; typically
   * bound to the *x* scale.
   */
  x?: ChannelValueSpec;

  /**
   * The vertical position channel specifying the image’s center; typically
   * bound to the *y* scale.
   */
  y?: ChannelValueSpec;

  /**
   * The image width in pixels. When a number, it is interpreted as a constant
   * radius in pixels; otherwise it is interpreted as a channel. Also sets the
   * default **height**; if neither are set, defaults to 16. Images with a
   * nonpositive width are not drawn.
   */
  width?: ChannelValue;

  /**
   * The image height in pixels. When a number, it is interpreted as a constant
   * radius in pixels; otherwise it is interpreted as a channel. Also sets the
   * default **height**; if neither are set, defaults to 16. Images with a
   * nonpositive height are not drawn.
   */
  height?: ChannelValue;

  /**
   * The image clip radius, for circular images. If null (default), images are
   * not clipped; when a number, it is interpreted as a constant in pixels;
   * otherwise it is interpreted as a channel, typically bound to the *r* scale.
   * Also defaults **height** and **width** to twice its value.
   */
  r?: ChannelValue;

  /**
   * The required image URL (or relative path). If a string that starts with a
   * dot, slash, or URL protocol (*e.g.*, “https:”) it is assumed to be a
   * constant; otherwise it is interpreted as a channel.
   */
  src?: ChannelValue;

  /**
   * The image [aspect ratio][1]; defaults to *xMidYMid meet*. To crop the image
   * instead of scaling it to fit, use *xMidYMid slice*.
   *
   * [1]: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/preserveAspectRatio
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
   * The frame anchor specifies defaults for **x** and **y** based on the plot’s
   * frame; it may be one of the four sides (*top*, *right*, *bottom*, *left*),
   * one of the four corners (*top-left*, *top-right*, *bottom-right*,
   * *bottom-left*), or the *middle* of the frame.
   */
  frameAnchor?: FrameAnchor;

  /**
   * The [image-rendering attribute][1]; defaults to *auto* (bilinear). The
   * option may be set to *pixelated* to disable bilinear interpolation for a
   * sharper image; however, note that this is not supported in WebKit.
   *
   * [1]: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/image-rendering
   */
  imageRendering?: string;
}

/**
 * Returns a new image mark for the given *data* and *options* that draws images
 * as in a scatterplot. For example, portraits of U.S. presidents by date of
 * inauguration and favorability:
 *
 * ```js
 * Plot.image(presidents, {x: "inauguration", y: "favorability", src: "portrait"})
 * ```
 *
 * If either **x** or **y** is not specified, the default is determined by the
 * **frameAnchor** option. If none of **x**, **y**, and **frameAnchor** are
 * specified, *data* is assumed to be an array of pairs [[*x₀*, *y₀*], [*x₁*,
 * *y₁*], [*x₂*, *y₂*], …] such that **x** = [*x₀*, *x₁*, *x₂*, …] and **y** =
 * [*y₀*, *y₁*, *y₂*, …].
 */
export function image(data?: Data, options?: ImageOptions): Image;

/** The image mark. */
export class Image extends RenderableMark {}
