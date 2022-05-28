import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  return Plot.plot({
    width: 960,
    height: 320,
    inset: 14,
    facet: {
      data: penguins,
      x: "sex",
      marginRight: 80
    },
    marks: [
      Plot.frame(),
      Plot.dot(penguins, Plot.hexbin({fillOpacity: "count"}, {x: "culmen_depth_mm", y: "culmen_length_mm", fill: "brown", stroke: "black", strokeWidth: 0.5})),
      Plot.text(penguins, Plot.hexbin({text: "count"}, {x: "culmen_depth_mm", y: "culmen_length_mm"}))
    ]
  });
}
