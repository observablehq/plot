import {cluster as Cluster} from "d3";
import {isNoneish} from "../options.js";
import {marks} from "../plot.js";
import {maybeTreeAnchor, treeLink, treeNode} from "../transforms/tree.js";
import {dot} from "./dot.js";
import {link} from "./link.js";
import {text} from "./text.js";

/**
 * A convenience compound mark for rendering a tree diagram, including a
 * [link](https://github.com/observablehq/plot/blob/main/README.md#link) to
 * render links from parent to child, an optional
 * [dot](https://github.com/observablehq/plot/blob/main/README.md#dot) for
 * nodes, and a
 * [text](https://github.com/observablehq/plot/blob/main/README.md#text) for
 * node labels. The link mark uses the [treeLink
 * transform](https://github.com/observablehq/plot/blob/main/README.md#plottreelinkoptions),
 * while the dot and text marks use the [treeNode
 * transform](https://github.com/observablehq/plot/blob/main/README.md#plottreenodeoptions).
 * The following options are supported:
 *
 * * **fill** - the dot and text fill color; defaults to *node:internal*
 * * **stroke** - the link stroke color; inherits **fill** by default
 * * **strokeWidth** - the link stroke width
 * * **strokeOpacity** - the link stroke opacity
 * * **strokeLinejoin** - the link stroke linejoin
 * * **strokeLinecap** - the link stroke linecap
 * * **strokeMiterlimit** - the link stroke miter limit
 * * **strokeDasharray** - the link stroke dash array
 * * **strokeDashoffset** - the link stroke dash offset
 * * **marker** - the link start and end marker
 * * **markerStart** - the link start marker
 * * **markerEnd** - the link end marker
 * * **dot** - if true, whether to render a dot; defaults to false if no link
 *   marker
 * * **title** - the text and dot title; defaults to *node:path*
 * * **text** - the text label; defaults to *node:name*
 * * **textStroke** - the text stroke; defaults to *white*
 * * **dx** - the text horizontal offset; defaults to 6 if left-anchored, or -6
 *   if right-anchored
 * * **dy** - the text vertical offset; defaults to 0
 *
 * Any additional *options* are passed through to the constituent link, dot, and
 * text marks and their corresponding treeLink or treeNode transform.
 */
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

/**
 * Like
 * [Plot.tree](https://github.com/observablehq/plot/blob/main/README.md#plottreedata-options),
 * except sets the **treeLayout** option to D3’s cluster (dendrogram) algorithm,
 * which aligns leaf nodes.
 */
export function cluster(data, options) {
  return tree(data, {...options, treeLayout: Cluster});
}
