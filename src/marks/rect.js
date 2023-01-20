import {create} from "../context.js";
import {identity, indexOf, number} from "../options.js";
import {Mark} from "../mark.js";
import {isCollapsed} from "../scales.js";
import {
  applyDirectStyles,
  applyIndirectStyles,
  applyTransform,
  impliedString,
  applyAttr,
  applyChannelStyles
} from "../style.js";
import {maybeIdentityX, maybeIdentityY} from "../transforms/identity.js";
import {maybeTrivialIntervalX, maybeTrivialIntervalY} from "../transforms/interval.js";
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
      {
        x1: {value: x1, scale: "x", optional: true},
        y1: {value: y1, scale: "y", optional: true},
        x2: {value: x2, scale: "x", optional: true},
        y2: {value: y2, scale: "y", optional: true}
      },
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
  render(index, scales, channels, dimensions, context) {
    const {x, y} = scales;
    const {x1: X1, y1: Y1, x2: X2, y2: Y2} = channels;
    const {marginTop, marginRight, marginBottom, marginLeft, width, height} = dimensions;
    const {projection} = context;
    const {insetTop, insetRight, insetBottom, insetLeft, rx, ry} = this;
    return create("svg:g", context)
      .call(applyIndirectStyles, this, dimensions, context)
      .call(applyTransform, this, {x: X1 && X2 && x, y: Y1 && Y2 && y}, 0, 0)
      .call((g) =>
        g
          .selectAll()
          .data(index)
          .enter()
          .append("rect")
          .call(applyDirectStyles, this)
          .attr(
            "x",
            X1 && X2 && (projection || !isCollapsed(x))
              ? (i) => Math.min(X1[i], X2[i]) + insetLeft
              : marginLeft + insetLeft
          )
          .attr(
            "y",
            Y1 && Y2 && (projection || !isCollapsed(y))
              ? (i) => Math.min(Y1[i], Y2[i]) + insetTop
              : marginTop + insetTop
          )
          .attr(
            "width",
            X1 && X2 && (projection || !isCollapsed(x))
              ? (i) => Math.max(0, Math.abs(X2[i] - X1[i]) - insetLeft - insetRight)
              : width - marginRight - marginLeft - insetRight - insetLeft
          )
          .attr(
            "height",
            Y1 && Y2 && (projection || !isCollapsed(y))
              ? (i) => Math.max(0, Math.abs(Y1[i] - Y2[i]) - insetTop - insetBottom)
              : height - marginTop - marginBottom - insetTop - insetBottom
          )
          .call(applyAttr, "rx", rx)
          .call(applyAttr, "ry", ry)
          .call(applyChannelStyles, this, channels)
      )
      .node();
  }
}

/** @jsdoc rect */
export function rect(data, options) {
  return new Rect(data, maybeTrivialIntervalX(maybeTrivialIntervalY(options)));
}

/** @jsdoc rectX */
export function rectX(data, options = {y: indexOf, interval: 1, x2: identity}) {
  return new Rect(data, maybeStackX(maybeTrivialIntervalY(maybeIdentityX(options))));
}

/** @jsdoc rectY */
export function rectY(data, options = {x: indexOf, interval: 1, y2: identity}) {
  return new Rect(data, maybeStackY(maybeTrivialIntervalX(maybeIdentityY(options))));
}
