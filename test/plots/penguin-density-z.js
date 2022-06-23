import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  return Plot.plot({
    width: 900,
    height: 330,
    facet: {
      data: penguins,
      x: "island"
    },
    inset: 20,
    marks: [
      Plot.density(penguins, {
        x: "flipper_length_mm",
        y: "culmen_length_mm",
        stroke: "species",
        fill: "species",
        title: "species",
        fillOpacity: 0.1,
        thresholds: 10,
        strokeWidth: 0.5,
        mixBlendMode: "multiply",
        clip: true
      }),
      Plot.frame()
    ]
  });
}
