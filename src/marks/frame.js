import {create} from "d3-selection";
import {Mark} from "../mark.js";
import {Style, applyDirectStyles, applyIndirectStyles} from "../style.js";

export class Frame extends Mark {
  constructor({
    fill = "none",
    stroke = "currentColor",
    ...style
  } = {}) {
    super();
    Style(this, {fill, stroke, ...style});
  }
  render(
    index,
    scales,
    channels,
    {marginTop, marginRight, marginBottom, marginLeft, width, height}
  ) {
    const {stroke} = this;
    const offset = stroke === "none" ? 0 : 0.5; // crisp edges
    return create("svg:rect")
        .call(applyIndirectStyles, this)
        .call(applyDirectStyles, this)
        .attr("x", marginLeft + offset)
        .attr("y", marginTop + offset)
        .attr("width", width - marginLeft - marginRight)
        .attr("height", height - marginTop - marginBottom)
      .node();
  }
}

export function frame(options) {
  return new Frame(options);
}
