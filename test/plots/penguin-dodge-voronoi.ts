import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function penguinDodgeVoronoi() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.plot({
    height: 200,
    marks: [
      Plot.voronoiMesh(penguins, Plot.dodgeY({x: "body_mass_g"})),
      Plot.dot(penguins, Plot.dodgeY({x: "body_mass_g", fill: "currentColor"}))
    ]
  });
}
