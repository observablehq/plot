import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

// Test channel transform composition.
export default async function () {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  return Plot.plot({
    height: 300,
    x: {
      grid: true,
      inset: 7
    },
    color: {
      legend: true
    },
    facet: {
      data: penguins,
      y: "species",
      label: null,
      marginLeft: 60
    },
    marks: [
      Plot.frame(),
      Plot.dot(penguins, Plot.dodgeY("bottom", {x: "body_mass_g", stroke: "red", r: 3})),
      Plot.dot(penguins, Plot.hexbin({}, Plot.dodgeY("bottom", {x: "body_mass_g", fill: "black", r: 3, binWidth: 7})))
    ]
  });
}
