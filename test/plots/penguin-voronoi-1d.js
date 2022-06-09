import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  return Plot.plot({
    inset: 10,
    marks: [
      Plot.voronoi(penguins, {
        x: "body_mass_g",
        fill: "species",
        fillOpacity: 0.5,
        title: d => `${d.species} (${d.sex})\n${d.island}`
      }),
      Plot.dot(penguins, {
        x: "body_mass_g",
        fill: "currentColor",
        r: 1.5,
        pointerEvents: "none"
      }),
      Plot.voronoiMesh(penguins, {
        x: "body_mass_g",
        pointerEvents: "none"
      })
    ]
  });
}
