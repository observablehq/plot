import {index} from "../value.js";

export function RectXY(X1, Y1, X2, Y2, options) {
  return RectIXY(index(X1), X1, Y1, X2, Y2, options);
}

export function RectIXY(I, X1, Y1, X2, Y2, {
  fill = "currentColor",
  fillOpacity,
  mixBlendMode,
  roundHorizontal,
  roundVertical,
  insetTop = 0,
  insetRight = 0,
  insetBottom = 0,
  insetLeft = 0
} = {}) {
  const {length} = X1;
  if (length !== Y1.length) throw new Error("X1 and Y1 are different length");
  if (length !== X2.length) throw new Error("X1 and X2 are different length");
  if (length !== Y2.length) throw new Error("X1 and Y2 are different length");
  return (x, y) => {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g"); // TODO d3.create
    if (fill != null) g.setAttribute("fill", fill);
    if (fillOpacity != null) g.setAttribute("fill-opacity", fillOpacity);
    for (const i of I) {
      let x1 = X1[i], y1 = Y1[i], x2 = X2[i], y2 = Y2[i];
      if (x1 == null || y1 == null || x2 == null || y2 == null) continue; // TODO Number.isNaN?
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect"); // TODO d3.create
      if (mixBlendMode != null) rect.style.mixBlendMode = mixBlendMode;
      x1 = x(x1);
      y1 = y(y1);
      x2 = x(x2);
      y2 = y(y2);
      if (roundHorizontal) x1 = Math.round(x1), x2 = Math.round(x2);
      if (roundVertical) y1 = Math.round(y1), y2 = Math.round(y2);
      if (x1 > x2) [x1, x2] = [x2, x1];
      if (y1 > y2) [y1, y2] = [y2, y1];
      x1 += insetLeft;
      x2 -= insetRight;
      y1 += insetTop;
      y2 -= insetBottom;
      if (x2 > x1 && y2 > y1) {
        rect.setAttribute("x", x1);
        rect.setAttribute("y", y1);
        rect.setAttribute("width", x2 - x1);
        rect.setAttribute("height", y2 - y1);
      }
      g.appendChild(rect);
    }
    return g;
  };
}
