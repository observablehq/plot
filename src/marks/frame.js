import {create} from "../context.js";
import {number} from "../options.js";
import {Mark} from "../mark.js";
import {applyDirectStyles, applyIndirectStyles, applyTransform} from "../style.js";

const defaults = {
  ariaLabel: "frame",
  fill: "none",
  stroke: "currentColor"
};

export class Frame extends Mark {
  constructor(options = {}) {
    const {inset = 0, insetTop = inset, insetRight = inset, insetBottom = inset, insetLeft = inset, rx, ry} = options;
    super(undefined, undefined, options, defaults);
    this.insetTop = number(insetTop);
    this.insetRight = number(insetRight);
    this.insetBottom = number(insetBottom);
    this.insetLeft = number(insetLeft);
    this.rx = number(rx);
    this.ry = number(ry);
  }
  render(index, scales, channels, dimensions, context) {
    const {marginTop, marginRight, marginBottom, marginLeft, width, height} = dimensions;
    const {insetTop, insetRight, insetBottom, insetLeft, rx, ry} = this;
    return create("svg:rect", context)
      .call(applyIndirectStyles, this, dimensions, context)
      .call(applyDirectStyles, this)
      .call(applyTransform, this, {})
      .attr("x", marginLeft + insetLeft)
      .attr("y", marginTop + insetTop)
      .attr("width", width - marginLeft - marginRight - insetLeft - insetRight)
      .attr("height", height - marginTop - marginBottom - insetTop - insetBottom)
      .attr("rx", rx)
      .attr("ry", ry)
      .node();
  }
}

/** @jsdoc frame */
export function frame(options) {
  return new Frame(options);
}
