import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function () {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  return Plot.plot({
    facet: {data: penguins, x: "island"},
    width: 860,
    height: 300,
    y: {nice: true},
    marks: [
      Plot.frame(),
      Plot.ruleY([0]),
      Plot.dot(
        penguins,
        Plot.mapY(
          "cumsum",
          Plot.sort("body_mass_g", {x: "body_mass_g", y: -1, fill: "island", facet: "exclude", z: null, r: 1})
        )
      ),
      Plot.lineY(
        penguins,
        Plot.mapY(
          "cumsum",
          Plot.sort("body_mass_g", {
            x: "body_mass_g",
            y: 1,
            strokeWidth: 2,
            stroke: "island",
            facet: "include",
            z: null
          })
        )
      )
    ]
  });
}
