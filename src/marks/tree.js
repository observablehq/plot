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
  markerStart,
  markerEnd,
  dot: dotDot = isNoneish(marker) && isNoneish(markerStart) && isNoneish(markerEnd),
  text: textText = "node:name",
  textStroke = "white",
  dx,
  ...options
} = {}) {
  if (dx === undefined) dx = maybeTreeAnchor(options.treeAnchor).dx;
  return marks(
    link(data, treeLink({marker, markerStart, markerEnd, stroke: stroke !== undefined ? stroke : fill === undefined ? "node:internal" : fill, strokeWidth, strokeOpacity, strokeLinejoin, strokeLinecap, strokeMiterlimit, strokeDasharray, strokeDashoffset, ...options})),
    dotDot ? dot(data, treeNode({fill: fill === undefined ? "node:internal" : fill, ...options})) : null,
    textText != null ? text(data, treeNode({text: textText, fill: fill === undefined ? "currentColor" : fill, stroke: textStroke, dx, ...options})) : null
  );
}

export function cluster(data, options) {
  return tree(data, {...options, treeLayout: Cluster});
}
