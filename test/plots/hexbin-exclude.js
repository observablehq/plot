import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function () {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  const noise = d3.randomNormal.source(d3.randomLcg(42))(0, 0.1);
  return Plot.plot({
    width: 960,
    height: 320,
    inset: 14,
    facet: {
      data: penguins,
      x: "species",
      marginRight: 80
    },
    marks: [
      Plot.frame(),
      Plot.dot(
        penguins,
        Plot.hexbin(
          {fillOpacity: "count"},
          Plot.map(
            {
              x: (X) => X.map((d) => d + noise()),
              y: (Y) => Y.map((d) => d + noise())
            },
            {
              x: "culmen_depth_mm",
              y: "culmen_length_mm",
              fill: "species",
              facet: "exclude"
            }
          )
        )
      ),
      Plot.dot(
        penguins,
        Plot.hexbin(
          {fillOpacity: "count"},
          {x: "culmen_depth_mm", y: "culmen_length_mm", fill: "species", stroke: "species"}
        )
      )
    ]
  });
}
