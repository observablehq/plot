import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function () {
  const data = await d3.csv("data/penguins.csv", d3.autoType);
  return Plot.plot({
    marks: [Plot.delaunayLink(data, {x: "culmen_depth_mm", y: "culmen_length_mm", stroke: "culmen_length_mm"})]
  });
}
