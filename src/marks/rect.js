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
      insetLeft = inset
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
    corners(this, options);
  }
  render(index, scales, channels, dimensions, context) {
    const {x, y} = scales;
    let {x1: X1, y1: Y1, x2: X2, y2: Y2} = channels;
    const {marginTop, marginRight, marginBottom, marginLeft, width, height} = dimensions;
    const {projection} = context;
    const {insetTop, insetRight, insetBottom, insetLeft} = this;
    const {rx, ry, rx1y1, rx1y2, rx2y1, rx2y2} = this;
    if ((X1 || X2) && !projection && isCollapsed(x)) X1 = X2 = null; // ignore if collapsed
    if ((Y1 || Y2) && !projection && isCollapsed(y)) Y1 = Y2 = null; // ignore if collapsed
    const bx = x?.bandwidth ? x.bandwidth() : 0;
    const by = y?.bandwidth ? y.bandwidth() : 0;
    return create("svg:g", context)
      .call(applyIndirectStyles, this, dimensions, context)
      .call(applyTransform, this, {}, 0, 0)
      .call((g) =>
        g
          .selectAll()
          .data(index)
          .enter()
          .call(
            rx1y1 || rx1y2 || rx2y1 || rx2y2
              ? (g) =>
                  g
                    .append("path")
                    .call(applyDirectStyles, this)
                    .attr("d", (i) =>
                      pathRoundedRect(
                        X1 ? X1[i] : marginLeft,
                        Y1 ? Y1[i] : marginTop,
                        X1 ? (X2 ? X2[i] : X1[i] + bx) : width - marginRight,
                        Y1 ? (Y2 ? Y2[i] : Y1[i] + by) : height - marginBottom,
                        this
                      )
                    )
                    .call(applyChannelStyles, this, channels)
              : (g) =>
                  g
                    .append("rect")
                    .call(applyDirectStyles, this)
                    .attr(
                      "x",
                      X1
                        ? X2
                          ? (i) => Math.min(X1[i], X2[i]) + insetLeft
                          : (i) => X1[i] + insetLeft
                        : marginLeft + insetLeft
                    )
                    .attr(
                      "y",
                      Y1
                        ? Y2
                          ? (i) => Math.min(Y1[i], Y2[i]) + insetTop
                          : (i) => Y1[i] + insetTop
                        : marginTop + insetTop
                    )
                    .attr(
                      "width",
                      X1
                        ? X2
                          ? (i) => Math.max(0, Math.abs(X2[i] - X1[i]) + bx - insetLeft - insetRight)
                          : bx - insetLeft - insetRight
                        : width - marginRight - marginLeft - insetRight - insetLeft
                    )
                    .attr(
                      "height",
                      Y1
                        ? Y2
                          ? (i) => Math.max(0, Math.abs(Y1[i] - Y2[i]) + by - insetTop - insetBottom)
                          : by - insetTop - insetBottom
                        : height - marginTop - marginBottom - insetTop - insetBottom
                    )
                    .call(applyAttr, "rx", rx)
                    .call(applyAttr, "ry", ry)
                    .call(applyChannelStyles, this, channels)
          )
      )
      .node();
  }
}

export function corners(
  mark,
  {
    r,
    rx, // for elliptic corners
    ry, // for elliptic corners
    rx1 = r,
    ry1 = r,
    rx2 = r,
    ry2 = r,
    rx1y1 = rx1 !== undefined ? +rx1 : ry1 !== undefined ? +ry1 : 0,
    rx1y2 = rx1 !== undefined ? +rx1 : ry2 !== undefined ? +ry2 : 0,
    rx2y1 = rx2 !== undefined ? +rx2 : ry1 !== undefined ? +ry1 : 0,
    rx2y2 = rx2 !== undefined ? +rx2 : ry2 !== undefined ? +ry2 : 0
  } = {}
) {
  if (rx1y1 || rx1y2 || rx2y1 || rx2y2) {
    mark.rx1y1 = Math.max(0, rx1y1);
    mark.rx1y2 = Math.max(0, rx1y2);
    mark.rx2y1 = Math.max(0, rx2y1);
    mark.rx2y2 = Math.max(0, rx2y2);
  } else {
    mark.rx = impliedString(rx, "auto"); // number or percentage
    mark.ry = impliedString(ry, "auto");
  }
}

export function pathRoundedRect(x1, y1, x2, y2, mark) {
  const {insetTop, insetRight, insetBottom, insetLeft} = mark;
  const {rx1y1: r11, rx1y2: r12, rx2y1: r21, rx2y2: r22} = mark;
  const ix = x1 > x2;
  const iy = y1 > y2;
  const l = (ix ? x2 : x1) + insetLeft;
  const r = (ix ? x1 : x2) - insetRight;
  const t = (iy ? y2 : y1) + insetTop;
  const b = (iy ? y1 : y2) - insetBottom;
  const k = Math.min(1, (r - l) / Math.max(r11 + r21, r12 + r22), (b - t) / Math.max(r11 + r12, r21 + r22));
  const tl = k * (ix ? (iy ? r22 : r21) : iy ? r12 : r11);
  const tr = k * (ix ? (iy ? r12 : r11) : iy ? r22 : r21);
  const br = k * (ix ? (iy ? r11 : r12) : iy ? r21 : r22);
  const bl = k * (ix ? (iy ? r21 : r22) : iy ? r11 : r12);
  return (
    `M${l},${t + tl}A${tl},${tl} 0 0 1 ${l + tl},${t}` +
    `H${r - tr}A${tr},${tr} 0 0 1 ${r},${t + tr}` +
    `V${b - br}A${br},${br} 0 0 1 ${r - br},${b}` +
    `H${l + bl}A${bl},${bl} 0 0 1 ${l},${b - bl}` +
    `Z`
  );
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
