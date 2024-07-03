import type {CompoundMark, Data, MarkOptions} from "../mark.js";
import type {TreeTransformOptions} from "../transforms/tree.js";
import type {DotOptions} from "./dot.js";
import type {LinkOptions} from "./link.js";
import type {TextOptions} from "./text.js";

// TODO tree channels, e.g., "node:name" | "node:path" | "node:internal" | "node:external"?

/** Options for the compound tree mark. */
export interface TreeOptions extends DotOptions, LinkOptions, TextOptions, TreeTransformOptions {
  /**
   * Whether to represent the node with a dot; defaults to true unless a
   * **marker** is specified.
   */
  dot?: boolean;

  /**
   * The **stroke** color for the text mark to improve the legibility of labels
   * atop other marks by creating a halo effect; defaults to *white*.
   */
  textStroke?: MarkOptions["stroke"];

  /**
   * Layout for node labels: if *mirrored*, leaf-node labels are left-anchored,
   * and non-leaf nodes right-anchored (with a -dx offset). If *normal*, all
   * labels are left-anchored. Defaults to *mirrored* unless a **treeLayout**
   * has been specified.
   */
  textLayout?: "mirrored" | "normal";
}

/**
 * Returns a compound tree mark, with a link to display edges from parent to
 * child, a dot to display nodes, and a text to display node labels.
 *
 * The tree layout is computed via the treeLink and treeNode transforms, which
 * transform a tabular dataset into a hierarchy according to the given **path**
 * input channel, which must contain **delimiter**-separated strings (forward
 * slash by default); then executes a tree layout algorithm, by default
 * [Reingold–Tilford’s “tidy” algorithm][1].
 *
 * [1]: https://d3js.org/d3-hierarchy/tree
 */
export function tree(data?: Data, options?: TreeOptions): CompoundMark;

/**
 * Shorthand for the tree mark using [d3.cluster][1] as the **treeLayout**
 * option, placing leaf nodes of the tree at the same depth. Equivalent to:
 *
 * ```js
 * Plot.tree(data, {...options, treeLayout: d3.cluster, textLayout: "mirrored"})
 * ```
 *
 * [1]: https://d3js.org/d3-hierarchy/cluster
 */
export function cluster(data?: Data, options?: TreeOptions): CompoundMark;
