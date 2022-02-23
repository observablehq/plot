import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  return Plot.plot({
    color: {scheme: "viridis", legend: true, label: "body mass (g)"},
    marks: [
      Plot.dot(penguins, Plot.hexbin({r: "count", fill: "median"}, {x: "culmen_depth_mm", y: "culmen_length_mm", fill: "body_mass_g", radius: 20, symbol: "circle"}))
    ]
  });
}
