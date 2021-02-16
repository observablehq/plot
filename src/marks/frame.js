import {create} from "d3-selection";
import {Mark, number} from "../mark.js";
import {Style, applyDirectStyles, applyIndirectStyles} from "../style.js";

export class Frame extends Mark {
  constructor({
    fill = "none",
    stroke = fill === null || fill === "none" ? "currentColor" : "none",
    inset = stroke === null || stroke === "none" ? 0 : 0.5,
    insetTop = inset,
    insetRight = inset,
    insetBottom = inset,
    insetLeft = inset,
    ...style
  } = {}) {
    super();
    Style(this, {fill, stroke, ...style});
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
