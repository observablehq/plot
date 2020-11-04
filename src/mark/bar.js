import {index} from "../value.js";

export function BarXYY(X, Y1, Y2, options) {
  return BarIXYY(index(X), X, Y1, Y2, options);
}

export function BarXXY(X1, X2, Y, options) {
  return BarIXXY(index(X1), X1, X2, Y, options);
}

export function BarIXYY(I, X, Y1, Y2, {
  fill = "currentColor",
  fillOpacity,
  mixBlendMode
} = {}) {
  const {length} = X;
  if (length !== Y1.length) throw new Error("X and Y1 are different length");
  if (length !== Y2.length) throw new Error("X and Y2 are different length");
  return (x, y) => {
    const w = x.bandwidth();
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g"); // TODO d3.create
    if (fill != null) g.setAttribute("fill", fill);
    if (fillOpacity != null) g.setAttribute("fill-opacity", fillOpacity);
    for (const i of I) {
      let x1 = X[i], y1 = Y1[i], y2 = Y2[i];
      if (x1 == null || y1 == null || y2 == null) continue; // TODO Number.isNaN?
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect"); // TODO d3.create
      if (mixBlendMode != null) rect.style.mixBlendMode = mixBlendMode;
      x1 = x(x1);
      y1 = y(y1);
      y2 = y(y2);
      if (y1 > y2) [y1, y2] = [y2, y1];
      if (y2 > y1) {
        rect.setAttribute("x", x1);
        rect.setAttribute("y", y1);
        rect.setAttribute("width", w);
        rect.setAttribute("height", y2 - y1);
      }
      g.appendChild(rect);
    }
    return g;
  };
}

export function BarIXXY(I, X1, X2, Y, {
  fill = "currentColor",
  fillOpacity,
  mixBlendMode
} = {}) {
  const {length} = X1;
  if (length !== X2.length) throw new Error("X1 and X2 are different length");
  if (length !== Y.length) throw new Error("X1 and Y are different length");
  return (x, y) => {
    const h = y.bandwidth();
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g"); // TODO d3.create
    if (fill != null) g.setAttribute("fill", fill);
    if (fillOpacity != null) g.setAttribute("fill-opacity", fillOpacity);
    for (const i of I) {
      let x1 = X1[i], x2 = X2[i], y1 = Y[i];
      if (x1 == null || x2 == null || y1 == null) continue; // TODO Number.isNaN?
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect"); // TODO d3.create
      if (mixBlendMode != null) rect.style.mixBlendMode = mixBlendMode;
      x1 = x(x1);
      x2 = x(x2);
      y1 = y(y1);
      if (x1 > x2) [x1, x2] = [x2, x1];
      if (x2 > x1) {
        rect.setAttribute("x", x1);
        rect.setAttribute("y", y1);
        rect.setAttribute("width", x2 - x1);
        rect.setAttribute("height", h);
      }
      g.appendChild(rect);
    }
    return g;
  };
}
