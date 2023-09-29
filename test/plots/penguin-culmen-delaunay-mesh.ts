import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function penguinCulmenDelaunayMesh() {
  const data = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.plot({
    marks: [
      Plot.delaunayMesh(data, {x: "culmen_depth_mm", y: "culmen_length_mm"}),
      Plot.dot(data, {x: "culmen_depth_mm", y: "culmen_length_mm"})
    ]
  });
}
