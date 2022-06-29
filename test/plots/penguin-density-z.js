import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function () {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  return Plot.plot({
    width: 960,
    height: 360,
    inset: 20,
    color: {
      legend: true
    },
    facet: {
      data: penguins,
      x: "island"
    },
    marks: [
      Plot.density(penguins, {
        x: "flipper_length_mm",
        y: "culmen_length_mm",
        stroke: "species",
        fill: "species",
        title: "species",
        fillOpacity: 0.1,
        thresholds: 10,
        mixBlendMode: "multiply",
        clip: true
      }),
      Plot.frame()
    ]
  });
}
