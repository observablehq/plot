import {stratify, treemap, treemapBinary} from "d3";
import {column, identity, valueof} from "../options.js";
import {basic} from "./basic.js";
import {maybeNodeValue, maybeTreeSort, normalizer} from "./tree.js";
import {output_evaluate, output_setValues, output_values, treeOutputs} from "./tree.js";

/** @jsdoc treeNode */
export function treemapNode(options = {}) {
  let {
    path = identity, // the delimited path
    delimiter, // how the path is separated
    frameAnchor,
    value,
    treeTile = treemapBinary,
    treeSort,
    ...remainingOptions
  } = options;
  treeSort = maybeTreeSort(treeSort);
  value = value == null ? null : maybeNodeValue(value) ?? asDataValue(value);
  const normalize = normalizer(delimiter);
  const outputs = treeOutputs(remainingOptions, maybeNodeValue);
  const [X1, setX1] = column();
  const [Y1, setY1] = column();
  const [X2, setX2] = column();
  const [Y2, setY2] = column();
  return {
    x1: X1,
    y1: Y1,
    x2: X2,
    y2: Y2,
    frameAnchor,
    ...basic(remainingOptions, (data, facets) => {
      const P = normalize(valueof(data, path));
      const X1 = setX1([]);
      const Y1 = setY1([]);
      const X2 = setX2([]);
      const Y2 = setY2([]);
      let treeIndex = -1;
      const treeData = [];
      const treeFacets = [];
      const rootof = stratify().path((i) => P[i]);
      const layout = treemap().tile(treeTile);
      for (const o of outputs) o[output_values] = o[output_setValues]([]);
      for (const facet of facets) {
        const treeFacet = [];
        const root = rootof(facet.filter((i) => P[i] != null)).each((node) => (node.data = data[node.data]));
        if (value) root.sum(value);
        else root.count();
        if (treeSort != null) root.sort(treeSort);
        layout(root);
        for (const node of root.leaves()) {
          treeFacet.push(++treeIndex);
          treeData[treeIndex] = node.data;
          X1[treeIndex] = node.x0;
          Y1[treeIndex] = node.y0;
          X2[treeIndex] = node.x1;
          Y2[treeIndex] = node.y1;
          for (const o of outputs) o[output_values][treeIndex] = o[output_evaluate](node);
        }
        treeFacets.push(treeFacet);
      }
      return {data: treeData, facets: treeFacets};
    }),
    ...Object.fromEntries(outputs)
  };
}

function asDataValue(value) {
  return typeof value === "function" ? value : (node) => node[value];
}
