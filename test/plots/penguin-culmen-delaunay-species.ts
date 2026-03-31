import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

if (import.meta.vitest) {
  await import("../plot.js").then((_) => _.declareTests(import.meta.filename));
}

export async function penguinCulmenDelaunaySpecies() {
  const data = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.plot({
    marks: [
      Plot.delaunayMesh(data, {
        x: "culmen_depth_mm",
        y: "culmen_length_mm",
        z: "species",
        stroke: "species",
        strokeOpacity: 1
      }),
      Plot.hull(data, {x: "culmen_depth_mm", y: "culmen_length_mm", stroke: "species", strokeWidth: 3})
    ]
  });
}
