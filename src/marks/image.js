import {create} from "../context.js";
import {positive} from "../defined.js";
import {Mark} from "../mark.js";
import {maybeFrameAnchor, maybeNumberChannel, maybeTuple, string} from "../options.js";
import {
  applyAttr,
  applyChannelStyles,
  applyDirectStyles,
  applyFrameAnchor,
  applyIndirectStyles,
  applyTransform,
  impliedString
} from "../style.js";
import {withDefaultSort} from "./dot.js";
import {template} from "../template.js";

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
    let {x, y, r, width, height, rotate, src, preserveAspectRatio, crossOrigin, frameAnchor, imageRendering} = options;
    if (r == null) r = undefined;
    if (r === undefined && width === undefined && height === undefined) width = height = 16;
    else if (width === undefined && height !== undefined) width = height;
    else if (height === undefined && width !== undefined) height = width;
    const [vs, cs] = maybePathChannel(src);
    const [vr, cr] = maybeNumberChannel(r);
    const [vw, cw] = maybeNumberChannel(width, cr !== undefined ? cr * 2 : undefined);
    const [vh, ch] = maybeNumberChannel(height, cr !== undefined ? cr * 2 : undefined);
    const [va, ca] = maybeNumberChannel(rotate, 0);
    super(
      data,
      {
        x: {value: x, scale: "x", optional: true},
        y: {value: y, scale: "y", optional: true},
        r: {value: vr, scale: "r", filter: positive, optional: true},
        width: {value: vw, filter: positive, optional: true},
        height: {value: vh, filter: positive, optional: true},
        rotate: {value: va, optional: true},
        src: {value: vs, optional: true}
      },
      withDefaultSort(options),
      defaults
    );
    this.src = cs;
    this.width = cw;
    this.rotate = ca;
    this.height = ch;
    this.r = cr;
    this.preserveAspectRatio = impliedString(preserveAspectRatio, "xMidYMid");
    this.crossOrigin = string(crossOrigin);
    this.frameAnchor = maybeFrameAnchor(frameAnchor);
    this.imageRendering = impliedString(imageRendering, "auto");
  }
  render(index, scales, channels, dimensions, context) {
    const {x, y} = scales;
    const {x: X, y: Y, width: W, height: H, r: R, rotate: A, src: S} = channels;
    const {r, width, height, rotate} = this;
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
          .attr("x", position(X, W, R, cx, width, r))
          .attr("y", position(Y, H, R, cy, height, r))
          .attr("width", W ? (i) => W[i] : width !== undefined ? width : R ? (i) => R[i] * 2 : r * 2)
          .attr("height", H ? (i) => H[i] : height !== undefined ? height : R ? (i) => R[i] * 2 : r * 2)
          // TODO: combine x, y, rotate and transform-origin into a single transform
          .attr("transform", A ? (i) => `rotate(${A[i]})` : rotate ? `rotate(${rotate})` : null)
          .attr("transform-origin", A || rotate ? template`${X ? (i) => X[i] : cx}px ${Y ? (i) => Y[i] : cy}px` : null)
          .call(applyAttr, "href", S ? (i) => S[i] : this.src)
          .call(applyAttr, "preserveAspectRatio", this.preserveAspectRatio)
          .call(applyAttr, "crossorigin", this.crossOrigin)
          .call(applyAttr, "image-rendering", this.imageRendering)
          .call(applyAttr, "clip-path", R ? (i) => `circle(${R[i]}px)` : r !== undefined ? `circle(${r}px)` : null)
          .call(applyChannelStyles, this, channels)
      )
      .node();
  }
}

function position(X, W, R, x, w, r) {
  return W && X
    ? (i) => X[i] - W[i] / 2
    : W
    ? (i) => x - W[i] / 2
    : X && w !== undefined
    ? (i) => X[i] - w / 2
    : w !== undefined
    ? x - w / 2
    : R && X
    ? (i) => X[i] - R[i]
    : R
    ? (i) => x - R[i]
    : X
    ? (i) => X[i] - r
    : x - r;
}

export function image(data, options = {}) {
  let {x, y, ...remainingOptions} = options;
  if (options.frameAnchor === undefined) [x, y] = maybeTuple(x, y);
  return new Image(data, {...remainingOptions, x, y});
}
