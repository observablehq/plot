import {create} from "../context.js";
import {positive} from "../defined.js";
import {Mark} from "../mark.js";
import {maybeFrameAnchor, maybeNumberChannel, maybeTuple, string} from "../options.js";
import {
  applyChannelStyles,
  applyDirectStyles,
  applyIndirectStyles,
  applyAttr,
  impliedString,
  applyFrameAnchor,
  applyTransform
} from "../style.js";

const defaults = {
  ariaLabel: "image",
  fill: null,
  stroke: null
};

// Tests if the given string is a path: does it start with a dot-slash
// (./foo.png), dot-dot-slash (../foo.png), or slash (/foo.png)?
function isPath(string) {
  return /^\.*\//.test(string);
}

// Tests if the given string is a URL (e.g., https://placekitten.com/200/300).
// The allowed protocols is overly restrictive, but we don’t want to allow any
// scheme here because it would increase the likelihood of a false positive with
// a field name that happens to contain a colon.
function isUrl(string) {
  return /^(blob|data|file|http|https):/i.test(string);
}

// Disambiguates a constant src definition from a channel. A path or URL string
// is assumed to be a constant; any other string is assumed to be a field name.
function maybePathChannel(value) {
  return typeof value === "string" && (isPath(value) || isUrl(value)) ? [undefined, value] : [value, undefined];
}

export class Image extends Mark {
  constructor(data, options = {}) {
    let {x, y, r, width, height, src, preserveAspectRatio, crossOrigin, frameAnchor, imageRendering} = options;
    if (width === undefined && height !== undefined) width = height;
    else if (height === undefined && width !== undefined) height = width;
    const [vs, cs] = maybePathChannel(src);
    const [vr, cr] = maybeNumberChannel(r);
    const [vw, cw] = maybeNumberChannel(width, r != null ? cr : 16);
    const [vh, ch] = maybeNumberChannel(height, r != null ? cr : 16);
    super(
      data,
      {
        x: {value: x, scale: "x", optional: true},
        y: {value: y, scale: "y", optional: true},
        r: {value: vr, scale: "r", filter: positive, optional: true},
        width: {value: vw, filter: positive, optional: true},
        height: {value: vh, filter: positive, optional: true},
        src: {value: vs, optional: true}
      },
      {
        ...(r != null && {clip: "circle()"}),
        ...options
      },
      defaults
    );
    this.src = cs;
    this.width = cw;
    this.height = ch;
    this.sw = width == null && r != null ? 1 : 1 / 2;
    this.sh = height == null && r != null ? 1 : 1 / 2;
    this.preserveAspectRatio = impliedString(preserveAspectRatio, "xMidYMid");
    this.crossOrigin = string(crossOrigin);
    this.frameAnchor = maybeFrameAnchor(frameAnchor);
    this.imageRendering = impliedString(imageRendering, "auto");
  }
  render(index, scales, channels, dimensions, context) {
    const {x, y} = scales;
    const {width, height, sw, sh} = this;
    const {x: X, y: Y, r: R, width: W = width == null && R, height: H = height == null && R, src: S} = channels;
    const [cx, cy] = applyFrameAnchor(this, dimensions);
    return create("svg:g", context)
      .call(applyIndirectStyles, this, dimensions, context)
      .call(applyTransform, this, {x: X && x, y: Y && y})
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
              ? (i) => X[i] - W[i] * sw
              : W
              ? (i) => cx - W[i] * sw
              : X
              ? (i) => X[i] - width * sw
              : cx - width * sw
          )
          .attr(
            "y",
            H && Y
              ? (i) => Y[i] - H[i] * sh
              : H
              ? (i) => cy - H[i] * sh
              : Y
              ? (i) => Y[i] - height * sh
              : cy - height * sh
          )
          .attr("width", W ? (i) => W[i] * 2 * sw : width * 2 * sw)
          .attr("height", H ? (i) => H[i] * 2 * sh : height * 2 * sh)
          .call(applyAttr, "href", S ? (i) => S[i] : this.src)
          .call(applyAttr, "preserveAspectRatio", this.preserveAspectRatio)
          .call(applyAttr, "crossorigin", this.crossOrigin)
          .call(applyAttr, "image-rendering", this.imageRendering)
          .call(applyChannelStyles, this, channels)
      )
      .node();
  }
}

export function image(data, options = {}) {
  let {x, y, ...remainingOptions} = options;
  if (options.frameAnchor === undefined) [x, y] = maybeTuple(x, y);
  return new Image(data, {...remainingOptions, x, y});
}
