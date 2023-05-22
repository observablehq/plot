import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function flareIndent() {
  const flare = await d3.csv<any>("data/flare.csv", d3.autoType);
  return Plot.plot({
    axis: null,
    inset: 10,
    insetLeft: 70,
    insetRight: 120,
    round: true,
    width: 300,
    height: 3600,
    marks: Plot.tree(flare, {
      strokeWidth: 1,
      r: 2.5,
      curve: "step-before",
      treeLayout: indent,
      path: "name",
      delimiter: "."
    })
  });
}

function indent() {
  return (root) => root.eachBefore((node, i) => ((node.y = node.depth), (node.x = i)));
}
