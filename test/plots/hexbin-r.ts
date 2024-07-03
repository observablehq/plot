import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function hexbinR() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  const xy = {fx: "sex", x: "culmen_depth_mm", y: "culmen_length_mm"};
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
    marks: [
      Plot.frame(),
      Plot.hexgrid(),
      Plot.dot(penguins, Plot.hexbin({title: "count", r: "count", fill: "proportion-facet"}, xy))
    ]
  });
}
