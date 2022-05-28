import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  return Plot.plot({
    x: {inset: 10},
    y: {inset: 10},
    marks: [
      Plot.frame(),
      Plot.hexgrid(),
      Plot.dot(penguins, Plot.hexbin({r: "count"}, {
        x: "culmen_depth_mm",
        y: "culmen_length_mm",
        stroke: "species",
        fill: "island",
        fillOpacity: 0.5,
        z: null,
        symbol: "dot" // TODO Plot.circle
      }))
    ]
  });
}
