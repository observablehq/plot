import {index} from "../value.js";

export function RectXY(X1, Y1, X2, Y2, options) {
  return RectIXY(index(X1), X1, Y1, X2, Y2, options);
}

export function RectIXY(I, X1, Y1, X2, Y2, {
  fill = "currentColor",
  fillOpacity,
  mixBlendMode
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
      x1 = Math.round(x(x1)); // TODO optional
      y1 = Math.round(y(y1)); // TODO optional
      x2 = Math.round(x(x2)); // TODO optional
      y2 = Math.round(y(y2)); // TODO optional
      if (x1 > x2) [x1, x2] = [x2, x1];
      if (y1 > y2) [y1, y2] = [y2, y1];
      rect.setAttribute("x", x1 + 1); // TODO optional
      rect.setAttribute("y", y1);
      rect.setAttribute("width", Math.max(0, x2 - x1 - 1)); // TODO optional
      rect.setAttribute("height", y2 - y1);
      g.appendChild(rect);
    }
    return g;
  };
}
