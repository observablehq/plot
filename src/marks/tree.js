import {cluster as Cluster} from "d3";
import {isNoneish} from "../options.js";
import {marks} from "../mark.js";
import {maybeTreeAnchor, treeLink, treeNode} from "../transforms/tree.js";
import {dot} from "./dot.js";
import {link} from "./link.js";
import {text} from "./text.js";

/** @jsdoc tree */
export function tree(data, options = {}) {
  let {
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
    ...remainingOptions
  } = options;
  if (dx === undefined) dx = maybeTreeAnchor(remainingOptions.treeAnchor).dx;
  return marks(
    link(
      data,
      treeLink({
        markerStart,
        markerEnd,
        stroke: stroke !== undefined ? stroke : fill === undefined ? "node:internal" : fill,
        strokeWidth,
        strokeOpacity,
        strokeLinejoin,
        strokeLinecap,
        strokeMiterlimit,
        strokeDasharray,
        strokeDashoffset,
        ...remainingOptions
      })
    ),
    dotDot
      ? dot(data, treeNode({fill: fill === undefined ? "node:internal" : fill, title, ...remainingOptions}))
      : null,
    textText != null
      ? text(
          data,
          treeNode({
            text: textText,
            fill: fill === undefined ? "currentColor" : fill,
            stroke: textStroke,
            dx,
            dy,
            title,
            ...remainingOptions
          })
        )
      : null
  );
}

/** @jsdoc cluster */
export function cluster(data, options) {
  return tree(data, {...options, treeLayout: Cluster});
}
