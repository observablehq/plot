import {create} from "../context.js";
import {positive} from "../defined.js";
import {maybeFrameAnchor, maybeTuple, string} from "../options.js";
import {Mark} from "../plot.js";
import {
  applyChannelStyles,
  applyDirectStyles,
  applyIndirectStyles,
  applyTransform,
  applyAttr,
  impliedString,
  applyFrameAnchor
} from "../style.js";
import {definition} from "../channel.js";

const defaults = {
  ariaLabel: "image",
  fill: null,
  stroke: null
};

export class Image extends Mark {
  constructor(data, options = {}) {
    let {x, y, width, height, src, preserveAspectRatio, crossOrigin, frameAnchor} = options;
    if (width === undefined && height !== undefined) width = height;
    else if (height === undefined && width !== undefined) height = width;
    const [vs, cs] = definition("src", src);
    const [vw, cw] = definition("width", width, 16);
    const [vh, ch] = definition("height", height, 16);
    super(
      data,
      {
        x: {value: x, optional: true},
        y: {value: y, optional: true},
        width: {value: vw, filter: positive, optional: true},
        height: {value: vh, filter: positive, optional: true},
        src: {value: vs, optional: true}
      },
      options,
      defaults
    );
    this.src = cs;
    this.width = cw;
    this.height = ch;
    this.preserveAspectRatio = impliedString(preserveAspectRatio, "xMidYMid");
    this.crossOrigin = string(crossOrigin);
    this.frameAnchor = maybeFrameAnchor(frameAnchor);
  }
  render(index, scales, channels, dimensions, context) {
    const {x: X, y: Y, width: W, height: H, src: S} = channels;
    const [cx, cy] = applyFrameAnchor(this, dimensions);
    return create("svg:g", context)
      .call(applyIndirectStyles, this, scales, dimensions)
      .call(applyTransform, this, scales)
      .call((g) =>
        g
          .selectAll()
          .data(index)
          .enter()
          .append("image")
          .call(applyDirectStyles, this)
          .attr(
            "x",
            W && X
              ? (i) => X[i] - W[i] / 2
              : W
              ? (i) => cx - W[i] / 2
              : X
              ? (i) => X[i] - this.width / 2
              : cx - this.width / 2
          )
          .attr(
            "y",
            H && Y
              ? (i) => Y[i] - H[i] / 2
              : H
              ? (i) => cy - H[i] / 2
              : Y
              ? (i) => Y[i] - this.height / 2
              : cy - this.height / 2
          )
          .attr("width", W ? (i) => W[i] : this.width)
          .attr("height", H ? (i) => H[i] : this.height)
          .call(applyAttr, "href", S ? (i) => S[i] : this.src)
          .call(applyAttr, "preserveAspectRatio", this.preserveAspectRatio)
          .call(applyAttr, "crossorigin", this.crossOrigin)
          .call(applyChannelStyles, this, channels)
      )
      .node();
  }
}

/**
 * ```js
 * Plot.image(presidents, {x: "inauguration", y: "favorability", src: "portrait"})
 * ```
 *
 * Returns a new image with the given *data* and *options*. If neither the **x**
 * nor **y** nor **frameAnchor** options are specified, *data* is assumed to be
 * an array of pairs [[*x₀*, *y₀*], [*x₁*, *y₁*], [*x₂*, *y₂*], …] such that
 * **x** = [*x₀*, *x₁*, *x₂*, …] and **y** = [*y₀*, *y₁*, *y₂*, …].
 */
export function image(data, options = {}) {
  let {x, y, ...remainingOptions} = options;
  if (options.frameAnchor === undefined) [x, y] = maybeTuple(x, y);
  return new Image(data, {...remainingOptions, x, y});
}
