import {marks} from "../plot.js";
import {treeLink, treeNode} from "../transforms/tree.js";
import {dot} from "./dot.js";
import {link} from "./link.js";
import {text} from "./text.js";

export function tree(data, {
  text: textText = "node:name",
  fill,
  stroke,
  textStroke = "white",
  dx = 6,
  ...options
} = {}) {
  const dotFill = fill === undefined ? "node:internal" : fill;
  const textFill = fill === undefined ? "currentColor" : fill;
  return marks(
    link(data, treeLink({stroke: stroke !== undefined ? stroke : dotFill, ...options})),
    dot(data, treeNode({fill: dotFill, ...options})),
    text(data, treeNode({text: textText, fill: textFill, stroke: textStroke, dx, ...options}))
  );
}
