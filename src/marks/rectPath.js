import {create} from "../context.js";
import {identity, indexOf, number} from "../options.js";
import {Mark} from "../plot.js";
import {isCollapsed} from "../scales.js";
import {applyDirectStyles, applyIndirectStyles, applyTransform, applyChannelStyles} from "../style.js";
import {maybeIdentityX, maybeIdentityY} from "../transforms/identity.js";
import {maybeTrivialIntervalX, maybeTrivialIntervalY} from "../transforms/interval.js";
import {maybeStackX, maybeStackY} from "../transforms/stack.js";

const defaults = {
  ariaLabel: "rect"
};

export class RectPath extends Mark {
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
      borderRadius = 0,
      borderTopRadius = borderRadius,
      borderBottomRadius = borderRadius,
      borderTopLeftRadius = borderTopRadius,
      borderTopRightRadius = borderTopRadius,
      borderBottomRightRadius = borderBottomRadius,
      borderBottomLeftRadius = borderBottomRadius
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

    // TODO All these could also be %
    this.borderTopLeftRadius = number(borderTopLeftRadius);
    this.borderTopRightRadius = number(borderTopRightRadius);
    this.borderBottomLeftRadius = number(borderBottomLeftRadius);
    this.borderBottomRightRadius = number(borderBottomRightRadius);
  }
  render(index, scales, channels, dimensions, context) {
    const {x, y} = scales;
    const {x1: X1, y1: Y1, x2: X2, y2: Y2} = channels;
    const {marginTop, marginRight, marginBottom, marginLeft, width, height} = dimensions;
    const {
      insetTop,
      insetRight,
      insetBottom,
      insetLeft,
      borderTopLeftRadius,
      borderTopRightRadius,
      borderBottomRightRadius,
      borderBottomLeftRadius
    } = this;
    return create("svg:g", context)
      .call(applyIndirectStyles, this, scales, dimensions)
      .call(applyTransform, this, {x: X1 && X2 ? x : null, y: Y1 && Y2 ? y : null}, 0, 0)
      .call((g) => {
        return g
          .selectAll()
          .data(index)
          .enter()
          .append("path")
          .call(applyDirectStyles, this)
          .attr("d", (i) => {
            const xC = X1 && X2 && !isCollapsed(x) ? Math.min(X1[i], X2[i]) + insetLeft : marginLeft + insetLeft;
            const yC = Y1 && Y2 && !isCollapsed(y) ? Math.min(Y1[i], Y2[i]) + insetTop : marginTop + insetTop;
            const widthC =
              X1 && X2 && !isCollapsed(x)
                ? Math.max(0, Math.abs(X2[i] - X1[i]) - insetLeft - insetRight)
                : width - marginRight - marginLeft - insetRight - insetLeft;
            const heightC =
              Y1 && Y2 && !isCollapsed(y)
                ? Math.max(0, Math.abs(Y1[i] - Y2[i]) - insetTop - insetBottom)
                : height - marginTop - marginBottom - insetTop - insetBottom;

            const radii = {
              topLeft: {
                x: Math.min(widthC / 2, borderTopLeftRadius),
                y: Math.min(heightC / 2, borderTopLeftRadius)
              },
              topRight: {
                x: Math.min(widthC / 2, borderTopRightRadius),
                y: Math.min(heightC / 2, borderTopRightRadius)
              },
              bottomRight: {
                x: Math.min(widthC / 2, borderBottomRightRadius),
                y: Math.min(heightC / 2, borderBottomRightRadius)
              },
              bottomLeft: {
                x: Math.min(widthC / 2, borderBottomLeftRadius),
                y: Math.min(heightC / 2, borderBottomLeftRadius)
              }
            };

            // start top-left, clockwise
            const corners = {
              topLeft: {
                start: [xC, yC + radii.topLeft.y],
                end: [xC + radii.topLeft.x, yC]
              },
              topRight: {
                start: [xC + widthC - radii.topRight.x, yC],
                end: [xC + widthC, yC + radii.topRight.y]
              },
              bottomRight: {
                start: [xC + widthC, yC + heightC - radii.bottomRight.y],
                end: [xC + widthC - radii.bottomRight.x, yC + heightC]
              },
              bottomLeft: {
                start: [xC + radii.bottomLeft.x, yC + heightC],
                end: [xC, yC + heightC - radii.bottomLeft.y]
              }
            };

            return `m${corners.topLeft.start.join(",")} a${radii.topLeft.x} ${radii.topLeft.y} 0 0 1 ${
              radii.topLeft.x
            } -${radii.topLeft.y} H${corners.topRight.start[0]} a${radii.topRight.x} ${radii.topRight.y} 0 0 1 ${
              radii.topRight.x
            } ${radii.topRight.y} V${corners.bottomRight.start[1]} a-${radii.bottomRight.x} ${
              radii.bottomRight.y
            } 0 0 1 -${radii.bottomRight.x} ${radii.bottomRight.y} H${corners.bottomLeft.start[0]} a-${
              radii.bottomLeft.x
            } -${radii.bottomLeft.y} 0 0 1 -${radii.bottomLeft.x} -${radii.bottomLeft.y} z`;
          })
          .call(applyChannelStyles, this, channels);
      })
      .node();
  }
}

export function rectPath(data, options) {
  return new RectPath(data, maybeTrivialIntervalX(maybeTrivialIntervalY(options)));
}

export function rectPathX(data, options = {y: indexOf, interval: 1, x2: identity}) {
  return new RectPath(data, maybeStackX(maybeTrivialIntervalY(maybeIdentityX(options))));
}

export function rectPathY(data, options = {x: indexOf, interval: 1, y2: identity}) {
  return new RectPath(data, maybeStackY(maybeTrivialIntervalX(maybeIdentityY(options))));
}
