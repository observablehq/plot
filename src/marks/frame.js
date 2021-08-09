import {create} from "d3";
import {Mark, number} from "../mark.js";
import {applyDirectStyles, applyIndirectStyles, applyTransform} from "../style.js";

const defaults = {
  fill: "none",
  stroke: "currentColor"
};

export class Frame extends Mark {
  constructor(options = {}) {
    const {
      inset = 0,
      insetTop = inset,
      insetRight = inset,
      insetBottom = inset,
      insetLeft = inset
    } = options;
    super(undefined, undefined, options, defaults);
    this.insetTop = number(insetTop);
    this.insetRight = number(insetRight);
    this.insetBottom = number(insetBottom);
    this.insetLeft = number(insetLeft);
  }
  render(
    index,
    scales,
    channels,
    {marginTop, marginRight, marginBottom, marginLeft, width, height}
  ) {
    return create("svg:rect")
        .call(applyIndirectStyles, this)
        .call(applyDirectStyles, this)
        .call(applyTransform, null, null, 0.5, 0.5)
        .attr("x", marginLeft + this.insetLeft)
        .attr("y", marginTop + this.insetTop)
        .attr("width", width - marginLeft - marginRight - this.insetLeft - this.insetRight)
        .attr("height", height - marginTop - marginBottom - this.insetTop - this.insetBottom)
      .node();
  }
}

export function frame(options) {
  return new Frame(options);
}
