import {create} from "../context.js";
import {Mark} from "../mark.js";
import {hasXY, identity, indexOf, number} from "../options.js";
import {isCollapsed} from "../scales.js";
import {applyAttr, applyChannelStyles, applyDirectStyles, applyIndirectStyles, applyTransform} from "../style.js";
import {impliedString} from "../style.js";
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
        x1: {value: x1, scale: "x", type: x1 != null && x2 == null ? "band" : undefined, optional: true},
        y1: {value: y1, scale: "y", type: y1 != null && y2 == null ? "band" : undefined, optional: true},
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
    const bx = (x?.bandwidth ? x.bandwidth() : 0) - insetLeft - insetRight;
    const by = (y?.bandwidth ? y.bandwidth() : 0) - insetTop - insetBottom;
    return create("svg:g", context)
      .call(applyIndirectStyles, this, dimensions, context)
      .call(applyTransform, this, {}, 0, 0)
      .call((g) =>
        g
          .selectAll()
          .data(index)
          .enter()
          .append("rect")
          .call(applyDirectStyles, this)
          .attr(
            "x",
            X1 && (projection || !isCollapsed(x))
              ? X2
                ? (i) => Math.min(X1[i], X2[i]) + insetLeft
                : (i) => X1[i] + insetLeft
              : marginLeft + insetLeft
          )
          .attr(
            "y",
            Y1 && (projection || !isCollapsed(y))
              ? Y2
                ? (i) => Math.min(Y1[i], Y2[i]) + insetTop
                : (i) => Y1[i] + insetTop
              : marginTop + insetTop
          )
          .attr(
            "width",
            X1 && (projection || !isCollapsed(x))
              ? X2
                ? (i) => Math.max(0, Math.abs(X2[i] - X1[i]) + bx)
                : bx
              : width - marginRight - marginLeft - insetRight - insetLeft
          )
          .attr(
            "height",
            Y1 && (projection || !isCollapsed(y))
              ? Y2
                ? (i) => Math.max(0, Math.abs(Y1[i] - Y2[i]) + by)
                : by
              : height - marginTop - marginBottom - insetTop - insetBottom
          )
          .call(applyAttr, "rx", rx)
          .call(applyAttr, "ry", ry)
          .call(applyChannelStyles, this, channels)
      )
      .node();
  }
}

export function rect(data, options) {
  return new Rect(data, maybeTrivialIntervalX(maybeTrivialIntervalY(options)));
}

export function rectX(data, options = {}) {
  if (!hasXY(options)) options = {...options, y: indexOf, x2: identity, interval: 1};
  return new Rect(data, maybeStackX(maybeTrivialIntervalY(maybeIdentityX(options))));
}

export function rectY(data, options = {}) {
  if (!hasXY(options)) options = {...options, x: indexOf, y2: identity, interval: 1};
  return new Rect(data, maybeStackY(maybeTrivialIntervalX(maybeIdentityY(options))));
}
