import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  return Plot.plot({
    height: 220,
    marks: [
      Plot.dot(penguins, Plot.dodgeY({
        x: "body_mass_g",
        symbol: "species",
        fill: "species",
        stroke: "white",
        strokeWidth: .5
      }))
    ],
    symbol: {legend: true}
  });
}
