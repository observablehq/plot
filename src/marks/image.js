import {create} from "d3";
import {filter, positive} from "../defined.js";
import {Mark, maybeNumber, maybeTuple, string} from "../mark.js";
import {applyChannelStyles, applyDirectStyles, applyIndirectStyles, applyTransform, applyAttr, offset, impliedString} from "../style.js";

const defaults = {
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
function maybePath(value) {
  return typeof value === "string" && (isPath(value) || isUrl(value))
    ? [undefined, value]
    : [value, undefined];
}

export class Image extends Mark {
  constructor(data, options = {}) {
    let {x, y, width, height, src, preserveAspectRatio, crossOrigin} = options;
    if (width === undefined && height !== undefined) width = height;
    else if (height === undefined && width !== undefined) height = width;
    const [vs, cs] = maybePath(src);
    const [vw, cw] = maybeNumber(width, 16);
    const [vh, ch] = maybeNumber(height, 16);
    super(
      data,
      [
        {name: "x", value: x, scale: "x", optional: true},
        {name: "y", value: y, scale: "y", optional: true},
        {name: "width", value: vw, optional: true},
        {name: "height", value: vh, optional: true},
        {name: "src", value: vs, optional: true}
      ],
      options,
      defaults
    );
    this.src = cs;
    this.width = cw;
    this.height = ch;
    this.preserveAspectRatio = impliedString(preserveAspectRatio, "xMidYMid");
    this.crossOrigin = string(crossOrigin);
  }
  render(
    I,
    {x, y},
    channels,
    {width, height, marginTop, marginRight, marginBottom, marginLeft}
  ) {
    const {x: X, y: Y, width: W, height: H, src: S} = channels;
    let index = filter(I, X, Y, S);
    if (W) index = index.filter(i => positive(W[i]));
    if (H) index = index.filter(i => positive(H[i]));
    const cx = (marginLeft + width - marginRight) / 2;
    const cy = (marginTop + height - marginBottom) / 2;
    return create("svg:g")
        .call(applyIndirectStyles, this)
        .call(applyTransform, x, y, offset, offset)
        .call(g => g.selectAll()
          .data(index)
          .join("image")
            .call(applyDirectStyles, this)
            .attr("x", W && X ? i => X[i] - W[i] / 2 : W ? i => cx - W[i] / 2 : X ? i => X[i] - this.width / 2 : cx - this.width / 2)
            .attr("y", H && Y ? i => Y[i] - H[i] / 2 : H ? i => cy - H[i] / 2 : Y ? i => Y[i] - this.height / 2 : cy - this.height / 2)
            .attr("width", W ? i => W[i] : this.width)
            .attr("height", H ? i => H[i] : this.height)
            .call(applyAttr, "href", S ? i => S[i] : this.src)
            .call(applyAttr, "preserveAspectRatio", this.preserveAspectRatio)
            .call(applyAttr, "crossorigin", this.crossOrigin)
            .call(applyChannelStyles, channels))
      .node();
  }
}

export function image(data, {x, y, ...options} = {}) {
  ([x, y] = maybeTuple(x, y));
  return new Image(data, {...options, x, y});
}
