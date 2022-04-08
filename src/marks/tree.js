import {marks} from "../plot.js";
import {maybeTreeAnchor, treeLink, treeNode} from "../transforms/tree.js";
import {dot} from "./dot.js";
import {link} from "./link.js";
import {text} from "./text.js";

export function tree(data, {
  fill,
  stroke,
  text: textText = "node:name",
  textStroke = "white",
  dx,
  ...options
} = {}) {
  if (dx === undefined) dx = maybeTreeAnchor(options.treeAnchor).dx;
  const dotFill = fill === undefined ? "node:internal" : fill;
  const textFill = fill === undefined ? "currentColor" : fill;
  return marks(
    link(data, treeLink({stroke: stroke !== undefined ? stroke : dotFill, ...options})),
    dot(data, treeNode({fill: dotFill, ...options})),
    text(data, treeNode({text: textText, fill: textFill, stroke: textStroke, dx, ...options}))
  );
}
