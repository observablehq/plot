import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const data = await (await d3.csv("data/penguins.csv", d3.autoType));
  return Plot.plot({
    marks: [
      Plot.delaunayMesh(data, {x: "culmen_depth_mm", y: "culmen_length_mm", stroke: "species", z: "species"}),
      Plot.gabrielMesh(data, {x: "culmen_depth_mm", y: "culmen_length_mm", stroke: "species", z: "species", strokeOpacity: 1}),
      Plot.dot(data, {x: "culmen_depth_mm", y: "culmen_length_mm", fill:"species", z: "species"})
    ]
  });
}
