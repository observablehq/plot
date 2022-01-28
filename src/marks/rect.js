import {create} from "d3";
import {number} from "../options.js";
import {Mark} from "../plot.js";
import {isCollapsed} from "../scales.js";
import {applyDirectStyles, applyIndirectStyles, applyTransform, impliedString, applyAttr, applyChannelStyles} from "../style.js";
import {maybeIdentityX, maybeIdentityY} from "../transforms/identity.js";
import {maybeIntervalX, maybeIntervalY} from "../transforms/interval.js";
import {maybeStackX, maybeStackY} from "../transforms/stack.js";

const defaults = {
  ariaLabel: "rect"
};

export class Rect extends Mark {
  constructor(data, options = {}) {
    const {
      x1,
      y1,
      x2,
      y2,
      inset = 0,
      insetTop = inset,
      insetRight = inset,
      insetBottom = inset,
      insetLeft = inset,
      rx,
      ry
    } = options;
    super(
      data,
      [
        {name: "x1", value: x1, scale: "x", optional: true},
        {name: "y1", value: y1, scale: "y", optional: true},
        {name: "x2", value: x2, scale: "x", optional: true},
        {name: "y2", value: y2, scale: "y", optional: true}
      ],
      options,
      defaults
    );
    this.insetTop = number(insetTop);
    this.insetRight = number(insetRight);
    this.insetBottom = number(insetBottom);
    this.insetLeft = number(insetLeft);
    this.rx = impliedString(rx, "auto"); // number or percentage
    this.ry = impliedString(ry, "auto");
  }
  render(index, {x, y}, channels, dimensions) {
    const {x1: X1, y1: Y1, x2: X2, y2: Y2} = channels;
    const {marginTop, marginRight, marginBottom, marginLeft, width, height} = dimensions;
    const {insetTop, insetRight, insetBottom, insetLeft, dx, dy, rx, ry} = this;
    return create("svg:g")
        .call(applyIndirectStyles, this)
        .call(applyTransform, x, y, dx, dy)
        .call(g => g.selectAll()
          .data(index)
          .join("rect")
            .call(applyDirectStyles, this)
            .attr("x", X1 && X2 && !isCollapsed(x) ? i => Math.min(X1[i], X2[i]) + insetLeft : marginLeft + insetLeft)
            .attr("y", Y1 && Y2 && !isCollapsed(y) ? i => Math.min(Y1[i], Y2[i]) + insetTop : marginTop + insetTop)
            .attr("width", X1 && X2 && !isCollapsed(x) ? i => Math.max(0, Math.abs(X2[i] - X1[i]) - insetLeft - insetRight) : width - marginRight - marginLeft - insetRight - insetLeft)
            .attr("height", Y1 && Y2 && !isCollapsed(y) ? i => Math.max(0, Math.abs(Y1[i] - Y2[i]) - insetTop - insetBottom) : height - marginTop - marginBottom - insetTop - insetBottom)
            .call(applyAttr, "rx", rx)
            .call(applyAttr, "ry", ry)
            .call(applyChannelStyles, this, channels))
      .node();
  }
}

export function rect(data, options) {
  return new Rect(data, maybeIntervalX(maybeIntervalY(options)));
}

export function rectX(data, options) {
  return new Rect(data, maybeStackX(maybeIntervalY(maybeIdentityX(options))));
}

export function rectY(data, options) {
  return new Rect(data, maybeStackY(maybeIntervalX(maybeIdentityY(options))));
}
