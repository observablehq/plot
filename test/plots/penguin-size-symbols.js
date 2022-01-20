import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  return Plot.plot({
    grid: true,
    x: {
      label: "Body mass (g) →"
    },
    y: {
      label: "↑ Flipper length (mm)"
    },
    symbol: {
      legend: true
    },
    marks: [
      Plot.dot(penguins, {x: "body_mass_g", y: "flipper_length_mm", stroke: "species", symbol: "species"})
    ]
  });
}
