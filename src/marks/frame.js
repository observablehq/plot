import {create} from "d3";
import {Mark} from "../plot.js";
import {number} from "../options.js";
import {applyDirectStyles, applyIndirectStyles, applyTransform} from "../style.js";

const defaults = {
  ariaLabel: "frame",
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
  render(index, scales, channels, dimensions) {
    const {marginTop, marginRight, marginBottom, marginLeft, width, height} = dimensions;
    const {insetTop, insetRight, insetBottom, insetLeft} = this;
    return create("svg:rect")
        .call(applyIndirectStyles, this, scales, dimensions)
        .call(applyDirectStyles, this)
        .call(applyTransform, this, {})
        .attr("x", marginLeft + insetLeft)
        .attr("y", marginTop + insetTop)
        .attr("width", width - marginLeft - marginRight - insetLeft - insetRight)
        .attr("height", height - marginTop - marginBottom - insetTop - insetBottom)
      .node();
  }
}

export function frame(options) {
  return new Frame(options);
}
