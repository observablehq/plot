import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const data = await d3.csv("data/penguins.csv", d3.autoType);
  
  return Plot.plot({
    facet: {
      data,
      x: "sex"
    },
    inset: 10,
    grid: true,
    x: { ticks: 10, tickFormat: "~s" },
    y: { ticks: 10 },
    marks: [
      Plot.frame(),
      Plot.dot(data, Plot.binR({
        thresholds: 10,
        x: "body_mass_g",
        y: "culmen_length_mm",
        stroke: "species",
        fill: "species",
        fillOpacity: .1
      }))
    ],
    width: 610,
    height: 300
  });
}