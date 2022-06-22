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
    color: {
      scheme: "magma",
      reverse: true
    },
    marks: [
      Plot.density(penguins, {
        x: "flipper_length_mm",
        y: "culmen_length_mm",
        stroke: "density",
        fill: "density",
        thresholds: 10,
        clip: true
      }),
      Plot.frame()
    ]
  });
}
