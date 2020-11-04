import {area} from "d3-shape";

export function AreaXYY(X, Y1, Y2, {
  fill = "currentColor",
  fillOpacity,
  stroke = "none",
  strokeWidth = stroke === "none" ? null : 1.5,
  strokeMiterlimit = stroke === "none" ? null : 1,
  strokeLinecap,
  strokeLinejoin,
  strokeDasharray,
  strokeOpacity,
  mixBlendMode
} = {}) {
  const {length} = X;
  if (length !== Y1.length) throw new Error("X and Y1 are different length");
  if (length !== Y2.length) throw new Error("X and Y1 are different length");
  const I = Uint32Array.from(X, (_, i) => i);
  return (x, y) => {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path"); // TODO d3.create
    if (mixBlendMode != null) path.style.mixBlendMode = mixBlendMode;
    path.setAttribute("d", area(i => x(X[i]), i => y(Y1[i]), i => y(Y2[i])).defined(i => X[i] != null && Y1[i] != null && Y2[i] != null)(I)); // TODO Number.isNaN?
    if (fill != null) path.setAttribute("fill", fill);
    if (fillOpacity != null) path.setAttribute("fill-opacity", fillOpacity);
    if (stroke != null) path.setAttribute("stroke", stroke);
    if (strokeWidth != null) path.setAttribute("stroke-width", strokeWidth);
    if (strokeMiterlimit != null) path.setAttribute("stroke-miterlimit", strokeMiterlimit);
    if (strokeLinecap != null) path.setAttribute("stroke-linecap", strokeLinecap);
    if (strokeLinejoin != null) path.setAttribute("stroke-linejoin", strokeLinejoin);
    if (strokeDasharray != null) path.setAttribute("stroke-dasharray", strokeDasharray);
    if (strokeOpacity != null) path.setAttribute("stroke-opacity", strokeOpacity);
    return path;
  };
}
