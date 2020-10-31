import {group} from "d3-array";
import {line} from "d3-shape";
import {range} from "../value.js";

export function LineXY(X, Y, options) {
  return LineXYZ(X, Y, null, options);
}

export function LineXYZ(X, Y, Z, options) {
  return LineIXYZ(range(X), X, Y, Z, options);
}

export function LineIXYZ(I, X, Y, Z, {
  fill = "none",
  fillOpacity,
  stroke = "currentColor",
  strokeWidth = 1.5,
  strokeMiterlimit = 1,
  strokeLinecap,
  strokeLinejoin,
  strokeDasharray,
  strokeOpacity,
  mixBlendMode
} = {}) {
  const {length} = X;
  if (length !== Y.length) throw new Error("X and Y are different length");
  if (Z && length !== Z.length) throw new Error("X and Z are different length");
  return (x, y) => {
    function style(node) {
      if (fill != null) node.setAttribute("fill", fill);
      if (fillOpacity != null) node.setAttribute("fill-opacity", fillOpacity);
      if (stroke != null) node.setAttribute("stroke", stroke);
      if (strokeWidth != null) node.setAttribute("stroke-width", strokeWidth);
      if (strokeMiterlimit != null) node.setAttribute("stroke-miterlimit", strokeMiterlimit);
      if (strokeLinecap != null) node.setAttribute("stroke-linecap", strokeLinecap);
      if (strokeLinejoin != null) node.setAttribute("stroke-linejoin", strokeLinejoin);
      if (strokeDasharray != null) node.setAttribute("stroke-dasharray", strokeDasharray);
      if (strokeOpacity != null) node.setAttribute("stroke-opacity", strokeOpacity);
      return node;
    }
    function path(I) {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path"); // TODO d3.create
      if (mixBlendMode != null) path.style.mixBlendMode = mixBlendMode;
      path.setAttribute("d", line(i => x(X[i]), i => y(Y[i])).defined(i => X[i] != null && Y[i] != null)(I)); // TODO Number.isNaN?
      return path;
    }
    if (Z) {
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g"); // TODO d3.create
      for (const G of group(I, i => Z[i]).values()) g.appendChild(path(G));
      return style(g);
    } else {
      return style(path(I));
    }
  };
}
