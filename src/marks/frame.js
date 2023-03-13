import {create} from "../context.js";
import {Mark} from "../mark.js";
import {maybeKeyword, number} from "../options.js";
import {applyDirectStyles, applyIndirectStyles, applyTransform} from "../style.js";

const defaults = {
  ariaLabel: "frame",
  fill: "none",
  stroke: "currentColor"
};

const lineDefaults = {
  ariaLabel: "frame",
  fill: null,
  stroke: "currentColor",
  strokeLinecap: "square"
};

export class Frame extends Mark {
  constructor(options = {}) {
    const {
      anchor = null,
      inset = 0,
      insetTop = inset,
      insetRight = inset,
      insetBottom = inset,
      insetLeft = inset,
      rx,
      ry
    } = options;
    super(undefined, undefined, options, anchor == null ? defaults : lineDefaults);
    this.anchor = maybeKeyword(anchor, "anchor", ["top", "right", "bottom", "left"]);
    this.insetTop = number(insetTop);
    this.insetRight = number(insetRight);
    this.insetBottom = number(insetBottom);
    this.insetLeft = number(insetLeft);
    this.rx = number(rx);
    this.ry = number(ry);
  }
  render(index, scales, channels, dimensions, context) {
    const {marginTop, marginRight, marginBottom, marginLeft, width, height} = dimensions;
    const {anchor, insetTop, insetRight, insetBottom, insetLeft, rx, ry} = this;
    const x1 = marginLeft + insetLeft;
    const x2 = width - marginRight - insetRight;
    const y1 = marginTop + insetTop;
    const y2 = height - marginBottom - insetBottom;
    return create(anchor ? "svg:line" : "svg:rect", context)
      .call(applyIndirectStyles, this, dimensions, context)
      .call(applyDirectStyles, this)
      .call(applyTransform, this, {})
      .call(
        anchor === "left"
          ? (line) => line.attr("x1", x1).attr("x2", x1).attr("y1", y1).attr("y2", y2)
          : anchor === "right"
          ? (line) => line.attr("x1", x2).attr("x2", x2).attr("y1", y1).attr("y2", y2)
          : anchor === "top"
          ? (line) => line.attr("x1", x1).attr("x2", x2).attr("y1", y1).attr("y2", y1)
          : anchor === "bottom"
          ? (line) => line.attr("x1", x1).attr("x2", x2).attr("y1", y2).attr("y2", y2)
          : (rect) =>
              rect
                .attr("x", x1)
                .attr("y", y1)
                .attr("width", x2 - x1)
                .attr("height", y2 - y1)
                .attr("rx", rx)
                .attr("ry", ry)
      )
      .node();
  }
}

export function frame(options) {
  return new Frame(options);
}
