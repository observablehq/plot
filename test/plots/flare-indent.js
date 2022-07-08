import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function () {
  const flare = await d3.csv("data/flare.csv", d3.autoType);
  return Plot.plot({
    axis: null,
    inset: 10,
    insetRight: 120,
    round: true,
    width: 200,
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
