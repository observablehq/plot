import {create} from "d3";
import {filter, positive} from "../defined.js";
import {Mark, maybeNumber, maybeTuple, string} from "../mark.js";
import {applyChannelStyles, applyDirectStyles, applyIndirectStyles, applyTransform, applyAttr, offset} from "../style.js";

const defaults = {};

export class Image extends Mark {
  constructor(data, options = {}) {
    const {x, y, width, height, src, preserveAspectRatio, crossOrigin} = options;
    const [vw, cw] = maybeNumber(width, 16);
    const [vh, ch] = maybeNumber(height, 16);
    super(
      data,
      [
        {name: "x", value: x, scale: "x", optional: true},
        {name: "y", value: y, scale: "y", optional: true},
        {name: "width", value: vw, optional: true},
        {name: "height", value: vh, optional: true},
        {name: "src", value: src, optional: false}
      ],
      options,
      defaults
    );
    this.width = cw;
    this.height = ch;
    this.preserveAspectRatio = string(preserveAspectRatio);
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
            .call(applyAttr, "href", S && (i => S[i]))
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
