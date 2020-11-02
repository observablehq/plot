import {index} from "../value.js";

export function DotXY(X, Y, options) {
  return DotIXY(index(X), X, Y, options);
}

export function DotIXY(I, X, Y, {
  fill = "none",
  fillOpacity,
  stroke = "currentColor",
  strokeWidth = 1.5,
  strokeDasharray,
  strokeOpacity,
  mixBlendMode
} = {}) {
  const {length} = X;
  if (length !== Y.length) throw new Error("X and Y are different length");
  return (x, y) => {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g"); // TODO d3.create
    if (fill != null) g.setAttribute("fill", fill);
    if (fillOpacity != null) g.setAttribute("fill-opacity", fillOpacity);
    if (stroke != null) g.setAttribute("stroke", stroke);
    if (strokeWidth != null) g.setAttribute("stroke-width", strokeWidth);
    if (strokeDasharray != null) g.setAttribute("stroke-dasharray", strokeDasharray);
    if (strokeOpacity != null) g.setAttribute("stroke-opacity", strokeOpacity);
    for (const i of I) {
      let cx = X[i], cy = Y[i];
      if (cx == null || cy == null) continue; // TODO Number.isNaN?
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle"); // TODO d3.create
      if (mixBlendMode != null) circle.style.mixBlendMode = mixBlendMode;
      circle.setAttribute("cx", x(cx));
      circle.setAttribute("cy", y(cy));
      circle.setAttribute("r", 2); // TODO
      g.appendChild(circle);
    }
    return g;
  };
}
