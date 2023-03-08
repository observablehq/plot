import {stratify, tree} from "d3";
import {ascendingDefined} from "../defined.js";
import {column, identity, isObject, one, valueof} from "../options.js";
import {basic} from "./basic.js";

export function treeNode(options = {}) {
  let {
    path = identity, // the delimited path
    delimiter, // how the path is separated
    frameAnchor,
    treeLayout = tree,
    treeSort,
    treeSeparation,
    treeAnchor,
    ...remainingOptions
  } = options;
  treeAnchor = maybeTreeAnchor(treeAnchor);
  treeSort = maybeTreeSort(treeSort);
  if (frameAnchor === undefined) frameAnchor = treeAnchor.frameAnchor;
  const normalize = normalizer(delimiter);
  const outputs = treeOutputs(remainingOptions, maybeNodeValue);
  const [X, setX] = column();
  const [Y, setY] = column();
  return {
    x: X,
    y: Y,
    frameAnchor,
    ...basic(remainingOptions, (data, facets) => {
      const P = normalize(valueof(data, path));
      const X = setX([]);
      const Y = setY([]);
      let treeIndex = -1;
      const treeData = [];
      const treeFacets = [];
      const rootof = stratify().path((i) => P[i]);
      const layout = treeLayout();
      if (layout.nodeSize) layout.nodeSize([1, 1]);
      if (layout.separation && treeSeparation !== undefined) layout.separation(treeSeparation ?? one);
      for (const o of outputs) o[output_values] = o[output_setValues]([]);
      for (const facet of facets) {
        const treeFacet = [];
        const root = rootof(facet.filter((i) => P[i] != null)).each((node) => (node.data = data[node.data]));
        if (treeSort != null) root.sort(treeSort);
        layout(root);
        for (const node of root.descendants()) {
          treeFacet.push(++treeIndex);
          treeData[treeIndex] = node.data;
          treeAnchor.position(node, treeIndex, X, Y);
          for (const o of outputs) o[output_values][treeIndex] = o[output_evaluate](node);
        }
        treeFacets.push(treeFacet);
      }
      return {data: treeData, facets: treeFacets};
    }),
    ...Object.fromEntries(outputs)
  };
}

export function treeLink(options = {}) {
  let {
    path = identity, // the delimited path
    delimiter, // how the path is separated
    curve = "bump-x",
    stroke = "#555",
    strokeWidth = 1.5,
    strokeOpacity = 0.5,
    treeLayout = tree,
    treeSort,
    treeSeparation,
    treeAnchor,
    ...remainingOptions
  } = options;
  treeAnchor = maybeTreeAnchor(treeAnchor);
  treeSort = maybeTreeSort(treeSort);
  remainingOptions = {curve, stroke, strokeWidth, strokeOpacity, ...remainingOptions};
  const normalize = normalizer(delimiter);
  const outputs = treeOutputs(remainingOptions, maybeLinkValue);
  const [X1, setX1] = column();
  const [X2, setX2] = column();
  const [Y1, setY1] = column();
  const [Y2, setY2] = column();
  return {
    x1: X1,
    x2: X2,
    y1: Y1,
    y2: Y2,
    ...basic(remainingOptions, (data, facets) => {
      const P = normalize(valueof(data, path));
      const X1 = setX1([]);
      const X2 = setX2([]);
      const Y1 = setY1([]);
      const Y2 = setY2([]);
      let treeIndex = -1;
      const treeData = [];
      const treeFacets = [];
      const rootof = stratify().path((i) => P[i]);
      const layout = treeLayout();
      if (layout.nodeSize) layout.nodeSize([1, 1]);
      if (layout.separation && treeSeparation !== undefined) layout.separation(treeSeparation ?? one);
      for (const o of outputs) o[output_values] = o[output_setValues]([]);
      for (const facet of facets) {
        const treeFacet = [];
        const root = rootof(facet.filter((i) => P[i] != null)).each((node) => (node.data = data[node.data]));
        if (treeSort != null) root.sort(treeSort);
        layout(root);
        for (const {source, target} of root.links()) {
          treeFacet.push(++treeIndex);
          treeData[treeIndex] = target.data;
          treeAnchor.position(source, treeIndex, X1, Y1);
          treeAnchor.position(target, treeIndex, X2, Y2);
          for (const o of outputs) o[output_values][treeIndex] = o[output_evaluate](target, source);
        }
        treeFacets.push(treeFacet);
      }
      return {data: treeData, facets: treeFacets};
    }),
    ...Object.fromEntries(outputs)
  };
}

export function maybeTreeAnchor(anchor = "left") {
  switch (`${anchor}`.trim().toLowerCase()) {
    case "left":
      return treeAnchorLeft;
    case "right":
      return treeAnchorRight;
  }
  throw new Error(`invalid tree anchor: ${anchor}`);
}

const treeAnchorLeft = {
  frameAnchor: "left",
  dx: 6,
  position({x, y}, i, X, Y) {
    X[i] = y;
    Y[i] = -x;
  }
};

const treeAnchorRight = {
  frameAnchor: "right",
  dx: -6,
  position({x, y}, i, X, Y) {
    X[i] = -y;
    Y[i] = -x;
  }
};

function maybeTreeSort(sort) {
  return sort == null || typeof sort === "function"
    ? sort
    : `${sort}`.trim().toLowerCase().startsWith("node:")
    ? nodeSort(maybeNodeValue(sort))
    : nodeSort(nodeData(sort));
}

function nodeSort(value) {
  return (a, b) => ascendingDefined(value(a), value(b));
}

function nodeData(field) {
  return (node) => node.data?.[field];
}

function normalizer(delimiter = "/") {
  return `${delimiter}` === "/"
    ? (P) => P // paths are already slash-separated
    : (P) => P.map(replaceAll(delimiter, "/")); // TODO string.replaceAll when supported
}

function replaceAll(search, replace) {
  search = new RegExp(regexEscape(search), "g");
  return (value) => (value == null ? null : `${value}`.replace(search, replace));
}

function regexEscape(string) {
  return `${string}`.replace(/[\\^$*+?.()|[\]{}]/g, "\\$&");
}

function isNodeValue(option) {
  return isObject(option) && typeof option.node === "function";
}

function isLinkValue(option) {
  return isObject(option) && typeof option.link === "function";
}

function maybeNodeValue(value) {
  if (isNodeValue(value)) return value.node;
  value = `${value}`.trim().toLowerCase();
  if (!value.startsWith("node:")) return;
  switch (value) {
    case "node:name":
      return nodeName;
    case "node:path":
      return nodePath;
    case "node:internal":
      return nodeInternal;
    case "node:depth":
      return nodeDepth;
    case "node:height":
      return nodeHeight;
  }
  throw new Error(`invalid node value: ${value}`);
}

function maybeLinkValue(value) {
  if (isNodeValue(value)) return value.node;
  if (isLinkValue(value)) return value.link;
  value = `${value}`.trim().toLowerCase();
  if (!value.startsWith("node:") && !value.startsWith("parent:")) return;
  switch (value) {
    case "parent:name":
      return parentValue(nodeName);
    case "parent:path":
      return parentValue(nodePath);
    case "parent:depth":
      return parentValue(nodeDepth);
    case "parent:height":
      return parentValue(nodeHeight);
    case "node:name":
      return nodeName;
    case "node:path":
      return nodePath;
    case "node:internal":
      return nodeInternal;
    case "node:depth":
      return nodeDepth;
    case "node:height":
      return nodeHeight;
  }
  throw new Error(`invalid link value: ${value}`);
}

function nodePath(node) {
  return node.id;
}

function nodeName(node) {
  return nameof(node.id);
}

function nodeDepth(node) {
  return node.depth;
}

function nodeHeight(node) {
  return node.height;
}

function nodeInternal(node) {
  return !!node.children;
}

function parentValue(evaluate) {
  return (child, parent) => (parent == null ? undefined : evaluate(parent));
}

// Walk backwards to find the first slash.
function nameof(path) {
  let i = path.length;
  while (--i > 0) if (slash(path, i)) break;
  return path.slice(i + 1);
}

// Slashes can be escaped; to determine whether a slash is a path delimiter, we
// count the number of preceding backslashes escaping the forward slash: an odd
// number indicates an escaped forward slash.
function slash(path, i) {
  if (path[i] === "/") {
    let k = 0;
    while (i > 0 && path[--i] === "\\") ++k;
    if ((k & 1) === 0) return true;
  }
  return false;
}

// These indexes match the array returned by nodeOutputs. The first two elements
// are always the name of the output and its column value definition so that
// the outputs can be passed directly to Object.fromEntries.
const output_setValues = 2;
const output_evaluate = 3;
const output_values = 4;

function treeOutputs(options, maybeTreeValue) {
  const outputs = [];
  for (const name in options) {
    const value = options[name];
    const treeValue = maybeTreeValue(value);
    if (treeValue !== undefined) {
      outputs.push([name, ...column(value), treeValue]);
    }
  }
  return outputs;
}
