import {create} from "d3";
import {filter, positive} from "../defined.js";
import {Mark, maybeNumber, maybeTuple, string} from "../mark.js";
import {applyChannelStyles, applyDirectStyles, applyIndirectStyles, applyTransform, applyAttr, offset} from "../style.js";

const defaults = {};

export class Image extends Mark {
  constructor(data, options = {}) {
    const {x, y, r, href, preserveAspectRatio, crossOrigin} = options;
    const [vr, cr] = maybeNumber(r, 15);
    super(
      data,
      [
        {name: "x", value: x, scale: "x", optional: true},
        {name: "y", value: y, scale: "y", optional: true},
        {name: "r", value: vr, scale: "r", optional: true},
        {name: "href", value: href, optional: false}
      ],
      options,
      defaults
    );
    this.r = cr;
    this.preserveAspectRatio = string(preserveAspectRatio);
    this.crossOrigin = string(crossOrigin);
  }
  render(
    I,
    {x, y},
    channels,
    {width, height, marginTop, marginRight, marginBottom, marginLeft}
  ) {
    const {x: X, y: Y, r: R, href: H} = channels;
    let index = filter(I, X, Y, R, H);
    if (R) index = index.filter(i => positive(R[i]));
    const cx = (marginLeft + width - marginRight) / 2;
    const cy = (marginTop + height - marginBottom) / 2;
    return create("svg:g")
        .call(applyIndirectStyles, this)
        .call(applyTransform, x, y, offset, offset)
        .call(g => g.selectAll()
          .data(index)
          .join("image")
            .call(applyDirectStyles, this)
            .attr("x", R && X ? i => X[i] - R[i] : R ? i => cx - R[i] : X ? i => X[i] - this.r : cx - this.r)
            .attr("y", R && Y ? i => Y[i] - R[i] : R ? i => cy - R[i] : Y ? i => Y[i] - this.r : cy - this.r)
            .attr("width", R ? i => R[i] * 2 : this.r * 2)
            .attr("height", R ? i => R[i] * 2 : this.r * 2)
            .call(applyAttr, "href", H && (i => H[i]))
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
