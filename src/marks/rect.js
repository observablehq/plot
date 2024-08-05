import {create} from "../context.js";
import {Mark} from "../mark.js";
import {constant, hasXY, identity, indexOf, number} from "../options.js";
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
    const {x1, y1, x2, y2} = options;
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
    rectInsets(this, options);
    rectRadii(this, options);
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
                    .call(
                      applyRoundedRect,
                      X1 && X2
                        ? (i) => X1[i] + (X2[i] < X1[i] ? -insetRight : insetLeft)
                        : X1
                        ? (i) => X1[i] + insetLeft
                        : marginLeft + insetLeft,
                      Y1 && Y2
                        ? (i) => Y1[i] + (Y2[i] < Y1[i] ? -insetBottom : insetTop)
                        : Y1
                        ? (i) => Y1[i] + insetTop
                        : marginTop + insetTop,
                      X1 && X2
                        ? (i) => X2[i] - (X2[i] < X1[i] ? -insetLeft : insetRight)
                        : X1
                        ? (i) => X1[i] + bx - insetRight
                        : width - marginRight - insetRight,
                      Y1 && Y2
                        ? (i) => Y2[i] - (Y2[i] < Y1[i] ? -insetTop : insetBottom)
                        : Y1
                        ? (i) => Y1[i] + by - insetBottom
                        : height - marginBottom - insetBottom,
                      this
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

export function rectInsets(
  mark,
  {inset = 0, insetTop = inset, insetRight = inset, insetBottom = inset, insetLeft = inset} = {}
) {
  mark.insetTop = number(insetTop);
  mark.insetRight = number(insetRight);
  mark.insetBottom = number(insetBottom);
  mark.insetLeft = number(insetLeft);
}

export function rectRadii(
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
    mark.rx1y1 = rx1y1;
    mark.rx1y2 = rx1y2;
    mark.rx2y1 = rx2y1;
    mark.rx2y2 = rx2y2;
  } else {
    mark.rx = impliedString(rx, "auto"); // number or percentage
    mark.ry = impliedString(ry, "auto");
  }
}

export function applyRoundedRect(selection, X1, Y1, X2, Y2, mark) {
  const {rx1y1: r11, rx1y2: r12, rx2y1: r21, rx2y2: r22} = mark;
  if (typeof X1 !== "function") X1 = constant(X1);
  if (typeof Y1 !== "function") Y1 = constant(Y1);
  if (typeof X2 !== "function") X2 = constant(X2);
  if (typeof Y2 !== "function") Y2 = constant(Y2);
  const rx = Math.max(Math.abs(r11 + r21), Math.abs(r12 + r22));
  const ry = Math.max(Math.abs(r11 + r12), Math.abs(r21 + r22));
  selection.attr("d", (i) => {
    const x1 = X1(i);
    const y1 = Y1(i);
    const x2 = X2(i);
    const y2 = Y2(i);
    const ix = x1 > x2;
    const iy = y1 > y2;
    const l = ix ? x2 : x1;
    const r = ix ? x1 : x2;
    const t = iy ? y2 : y1;
    const b = iy ? y1 : y2;
    const k = Math.min(1, (r - l) / rx, (b - t) / ry);
    const tl = k * (ix ? (iy ? r22 : r21) : iy ? r12 : r11);
    const tr = k * (ix ? (iy ? r12 : r11) : iy ? r22 : r21);
    const br = k * (ix ? (iy ? r11 : r12) : iy ? r21 : r22);
    const bl = k * (ix ? (iy ? r21 : r22) : iy ? r11 : r12);
    return (
      `M${l},${t + biasY(tl, bl)}A${tl},${tl} 0 0 ${tl < 0 ? 0 : 1} ${l + biasX(tl, bl)},${t}` +
      `H${r - biasX(tr, br)}A${tr},${tr} 0 0 ${tr < 0 ? 0 : 1} ${r},${t + biasY(tr, br)}` +
      `V${b - biasY(br, tr)}A${br},${br} 0 0 ${br < 0 ? 0 : 1} ${r - biasX(br, tr)},${b}` +
      `H${l + biasX(bl, tl)}A${bl},${bl} 0 0 ${bl < 0 ? 0 : 1} ${l},${b - biasY(bl, tl)}` +
      `Z`
    );
  });
}

/**
 * If the opposing corner has a negative radius r2, if this corner has a
 * negative radius r1, this corner’s “wing” will extend horizontally rather than
 * vertically.
 */
function biasX(r1, r2) {
  return r2 < 0 ? r1 : Math.abs(r1);
}

/**
 * If the opposing corner has a negative radius r2, if this corner has a
 * negative radius r1, this corner’s “wing” will extend horizontally rather than
 * vertically.
 */
function biasY(r1, r2) {
  return r2 < 0 ? Math.abs(r1) : r1;
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
