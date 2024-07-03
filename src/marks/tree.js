import {cluster as Cluster, tree as Tree} from "d3";
import {marks} from "../mark.js";
import {isNoneish} from "../options.js";
import {maybeTreeAnchor, treeLink, treeNode} from "../transforms/tree.js";
import {dot} from "./dot.js";
import {link} from "./link.js";
import {text} from "./text.js";
import {keyword} from "../options.js";

export function tree(
  data,
  {
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
    textStroke = "var(--plot-background)",
    title = "node:path",
    dx,
    dy,
    textAnchor,
    treeLayout = Tree,
    textLayout = treeLayout === Tree || treeLayout === Cluster ? "mirrored" : "normal",
    tip,
    ...options
  } = {}
) {
  if (dx === undefined) dx = maybeTreeAnchor(options.treeAnchor).dx;
  if (textAnchor !== undefined) throw new Error("textAnchor is not a configurable tree option");
  textLayout = keyword(textLayout, "textLayout", ["mirrored", "normal"]);

  function treeText(textOptions) {
    return text(
      data,
      treeNode({
        treeLayout,
        text: textText,
        fill: fill === undefined ? "currentColor" : fill,
        stroke: textStroke,
        dx,
        dy,
        title,
        ...textOptions,
        ...options
      })
    );
  }

  return marks(
    link(
      data,
      treeLink({
        treeLayout,
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
        ...options
      })
    ),
    dotDot
      ? dot(data, treeNode({treeLayout, fill: fill === undefined ? "node:internal" : fill, title, tip, ...options}))
      : null,
    textText != null
      ? textLayout === "mirrored"
        ? [
            treeText({textAnchor: "start", treeFilter: "node:external"}),
            treeText({textAnchor: "end", treeFilter: "node:internal", dx: -dx})
          ]
        : treeText()
      : null
  );
}

export function cluster(data, options) {
  return tree(data, {...options, treeLayout: Cluster});
}
