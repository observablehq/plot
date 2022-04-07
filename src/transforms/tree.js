import {stratify, tree as Tree} from "d3";
import {channel, isObject, one, range, valueof} from "../options.js";

export function treeNode({
  path, // the delimited path
  delimiter, // how the path is separated
  frameAnchor = "left", // TODO different orientations
  tree = Tree,
  treeSort,
  treeSeparation,
  ...options
} = {}) {
  const normalize = normalizer(delimiter);
  const outputs = treeOutputs(options, maybeNodeValue);
  const [X, setX] = channel();
  const [Y, setY] = channel();
  return {
    x: X,
    y: Y,
    frameAnchor,
    ...options,
    transform(data, facets) {
      const P = normalize(valueof(data, path));
      const root = stratify().path((i) => P[i])(range(data));
      const layout = tree().nodeSize([1, 1]);
      if (treeSort != null) root.sort(treeSort);
      if (treeSeparation !== undefined) layout.separation(treeSeparation ?? one);
      layout(root);
      const X = setX([]);
      const Y = setY([]);
      for (const o of outputs) o[output_values] = o[output_setValues]([]);
      for (const node of root.descendants()) {
        const i = node.data;
        if (i === undefined) continue; // imputed node
        X[i] = node.y;
        Y[i] = -node.x;
        for (const o of outputs) o[output_values][i] = o[output_evaluate](node);
      }
      return {data, facets};
    },
    ...Object.fromEntries(outputs)
  };
}

export function treeLink({
  path, // the delimited path
  delimiter, // how the path is separated
  curve = "bump-x", // TODO depends on orientation
  tree = Tree,
  treeSort,
  treeSeparation,
  ...options
} = {}) {
  const {stroke = "#555", strokeWidth = 1.5, strokeOpacity = 0.4} = options;
  const normalize = normalizer(delimiter);
  const outputs = treeOutputs(options, maybeLinkValue);
  const [X1, setX1] = channel();
  const [X2, setX2] = channel();
  const [Y1, setY1] = channel();
  const [Y2, setY2] = channel();
  return {
    x1: X1,
    x2: X2,
    y1: Y1,
    y2: Y2,
    ...options,
    curve,
    stroke,
    strokeWidth,
    strokeOpacity,
    transform(data, facets) {
      const P = normalize(valueof(data, path));
      const root = stratify().path(i => P[i])(range(data));
      const layout = tree().nodeSize([1, 1]);
      if (treeSort != null) root.sort(treeSort);
      if (treeSeparation !== undefined) layout.separation(treeSeparation ?? one);
      layout(root);
      const X1 = setX1([]);
      const X2 = setX2([]);
      const Y1 = setY1([]);
      const Y2 = setY2([]);
      for (const o of outputs) o[output_values] = o[output_setValues]([]);
      for (const {source, target} of root.links()) {
        const i = target.data;
        if (i === undefined) continue; // imputed node
        X1[i] = source.y;
        X2[i] = target.y;
        Y1[i] = -source.x;
        Y2[i] = -target.x;
        for (const o of outputs) o[output_values][i] = o[output_evaluate](target, source);
      }
      if (root.data !== undefined) for (const o of outputs) o[output_values][root.data] = o[output_evaluate](root, null);
      return {data, facets};
    },
    ...Object.fromEntries(outputs)
  };
}

function normalizer(delimiter = "/") {
  return `${delimiter}` === "/"
    ? P => P // paths are already slash-separated
    : P => P.map(replaceAll(delimiter, "/")); // TODO string.replaceAll when supported
}

function replaceAll(search, replace) {
  search = new RegExp(regexEscape(search), "g");
  return value => value.replace(search, replace);
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
    case "node:name": return nodeName;
    case "node:path": return nodePath;
    case "node:internal": return nodeInternal;
    case "node:depth": return nodeDepth;
    case "node:height": return nodeHeight;
  }
  throw new Error(`invalid node value: ${value}`);
}

function maybeLinkValue(value) {
  if (isNodeValue(value)) return value.node;
  if (isLinkValue(value)) return value.link;
  value = `${value}`.trim().toLowerCase();
  if (!value.startsWith("node:") && !value.startsWith("parent:")) return;
  switch (value) {
    case "parent:name": return parentValue(nodeName);
    case "parent:path": return parentValue(nodePath);
    case "parent:depth": return parentValue(nodeDepth);
    case "parent:height": return parentValue(nodeHeight);
    case "node:name": return nodeName;
    case "node:path": return nodePath;
    case "node:internal": return nodeInternal;
    case "node:depth": return nodeDepth;
    case "node:height": return nodeHeight;
  }
  throw new Error(`invalid link value: ${value}`);
}

function nodePath(node) {
  return node.id;
}

function nodeName(node) {
  return node.id.split("/").pop();
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
  return (child, parent) => parent == null ? undefined : evaluate(parent);
}

// These indexes match the array returned by nodeOutputs. The first two elements
// are always the name of the output and its channel value definition so that
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
      outputs.push([name, ...channel(value), treeValue]);
    }
  }
  return outputs;
}
