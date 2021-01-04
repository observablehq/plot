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
      axis: null
    },
    facet: {
      data,
      y: "sex",
      marginLeft: 70
    },
    marks: [
      Plot.binX(data, {x: "body_mass_g"}),
      Plot.ruleY([0])
    ]
  });
}
