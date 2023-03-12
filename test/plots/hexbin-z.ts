import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function hexbinZ() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.plot({
    inset: 10,
    color: {
      legend: true
    },
    marks: [
      Plot.hexgrid(),
      Plot.frame(),
      Plot.dot(penguins, Plot.hexbin({r: "count"}, {x: "culmen_length_mm", y: "body_mass_g", stroke: "species"}))
    ]
  });
}
