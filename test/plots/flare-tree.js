import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function () {
  const flare = await d3.csv("data/flare.csv", d3.autoType);
  return Plot.plot({
    axis: null,
    inset: 10,
    insetRight: 120,
    height: 1800,
    marks: Plot.tree(flare, {markerEnd: "arrow", path: "name", delimiter: "."})
  });
}
