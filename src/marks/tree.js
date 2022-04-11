import {cluster as Cluster} from "d3";
import {isNoneish} from "../options.js";
import {marks} from "../plot.js";
import {maybeTreeAnchor, treeLink, treeNode} from "../transforms/tree.js";
import {dot} from "./dot.js";
import {link} from "./link.js";
import {text} from "./text.js";

export function tree(data, {
  fill,
  stroke,
  strokeWidth,
  strokeOpacity,
  strokeLinejoin,
  strokeLinecap,
  strokeMiterlimit,
  strokeDasharray,
  strokeDashoffset,
  marker,
  markerStart = marker,
  markerEnd = marker,
  dot: dotDot = isNoneish(markerStart) && isNoneish(markerEnd),
  text: textText = "node:name",
  textStroke = "white",
  title = "node:path",
  dx,
  dy,
  ...options
} = {}) {
  if (dx === undefined) dx = maybeTreeAnchor(options.treeAnchor).dx;
  const m = marks(
    link(data, treeLink({markerStart, markerEnd, stroke: stroke !== undefined ? stroke : fill === undefined ? "node:internal" : fill, strokeWidth, strokeOpacity, strokeLinejoin, strokeLinecap, strokeMiterlimit, strokeDasharray, strokeDashoffset, ...options})),
    dotDot ? dot(data, treeNode({fill: fill === undefined ? "node:internal" : fill, title, ...options})) : null,
    textText != null ? text(data, treeNode({text: textText, fill: fill === undefined ? "currentColor" : fill, stroke: textStroke, dx, dy, title, ...options})) : null
  );

  // default options for shorthand tree().plot()
  const plot = m.plot;
  // {insetLeft: 10, insetTop: 20, insetBottom: 20, insetRight: 120, x: {axis: null}, y: {axis: null}}
  m.plot = function({x = {axis: null}, y = {axis: null}, inset = undefined, insetLeft = inset != null ? inset : 10, insetTop = 20, insetBottom = 20, insetRight = 120, ...options} = {}) {
    return plot.call(this, {x, y, insetLeft, insetRight, insetTop, insetBottom, ...options});
  };
  return m;
}

export function cluster(data, options) {
  return tree(data, {...options, treeLayout: Cluster});
}
