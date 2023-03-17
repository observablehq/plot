import type {CompoundMark, Data, MarkOptions} from "../mark.js";
import type {TreeTransformOptions} from "../transforms/tree.js";
import type {DotOptions} from "./dot.js";
import type {LinkOptions} from "./link.js";
import type {TextOptions} from "./text.js";

// TODO tree channels, e.g., "node:name" | "node:path" | "node:internal"?
export interface TreeOptions extends DotOptions, LinkOptions, TextOptions, TreeTransformOptions {
  /**
   * Should the node be represented by a dot. Defaults to true unless a **marker** is specified.
   */
  dot?: boolean;
  /**
   * A **stroke** color to pass to the text mark, to limit label occlusion. Defaults to white.
   */
  textStroke?: MarkOptions["stroke"];
}

/**
 * Transforms a tabular dataset into a hierarchy according to the given **path** input channel, which is typically a slash-separated string; then executes a tree layout algorithm to compute **x** and **y** output channels; these channels can then be fed to other marks to construct a node-link diagram.
 *
 * The following options control how the tabular data is organized into a hierarchy:
 *
 * * **path** - a channel specifying each node’s hierarchy location; defaults to identity
 * * **delimiter** - the path separator; defaults to forward slash (/)
 *
 * The following options control how the node-link diagram is laid out:
 *
 * * **treeLayout** - a tree layout algorithm; defaults to [d3.tree](https://github.com/d3/d3-hierarchy/blob/main/README.md#tree)
 * * **treeAnchor** - a tree layout orientation, either *left* or *right*; defaults to *left*
 * * **treeSort** - a node comparator, or null to preserve input order
 * * **treeSeparation** - a node separation function, or null for uniform separation
 *
 */
export function tree(data?: Data, options?: TreeOptions): CompoundMark;

export function cluster(data?: Data, options?: TreeOptions): CompoundMark;
