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
    marks: [
      Plot.frame(),
      Plot.dot(data, Plot.binR({
        thresholds: 10,
        x: "body_mass_g",
        y: "culmen_length_mm",
        z: "species",
        fill: "z",
        fillOpacity: .1,
        stroke: "z"
      }))
    ],
    width: 610,
    height: 300
  });
}