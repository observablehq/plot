import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function () {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  return Plot.plot({
    width: 960,
    height: 320,
    color: {
      scheme: "reds",
      label: "Proportion of each sex (%)",
      zero: true,
      percent: true,
      legend: true
    },
    facet: {
      data: penguins,
      x: "sex",
      marginRight: 80
    },
    marks: [
      Plot.frame(),
      Plot.dot(
        penguins,
        Plot.hexbin(
          {title: "count", r: "count", fill: "proportion-facet"},
          {x: "culmen_depth_mm", y: "culmen_length_mm"}
        )
      )
    ]
  });
}
