import * as Plot from "@observablehq/plot";
import {csv} from "d3-fetch";
import {autoType} from "d3-dsv";

export default async function() {
  const data = await csv("data/penguins.csv", autoType);
  return Plot.plot({
    x: {
      round: true,
      label: "Body mass (g) →"
    },
    y: {
      grid: true
    },
    marks: [
      Plot.binX(data, {x: "body_mass_g"}),
      Plot.ruleY([0])
    ]
  });
}
