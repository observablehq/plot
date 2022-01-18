import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const data = await d3.csv("data/penguins.csv", d3.autoType);
  return Plot.plot({
    x: {
      round: true,
      label: "Body mass (g) →"
    },
    y: {
      grid: true
    },
    marks: [
      Plot.rectY(data, Plot.binX({y: "count"}, {x: "body_mass_g", fill: "species", title: d => `${d.species} ${d.sex}`})),
      Plot.ruleY([0])
    ]
  });
}
