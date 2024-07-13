import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function facetReindex() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  const island = Plot.valueof(penguins, "island");
  return Plot.plot({
    width: 830,
    marginLeft: 74,
    marginRight: 68,
    height: 130,
    x: {domain: [0, penguins.length], round: true},
    y: {label: "facet option", axis: "right"},
    facet: {data: penguins, y: island},
    fy: {label: "facet value"},
    marks: [
      Plot.barX(penguins, {
        facet: "exclude",
        fill: island, // array channel to be reindexed
        x: 1,
        y: () => "exclude",
        fillOpacity: 0.5,
        insetRight: 0.5
      }),
      Plot.barX(penguins, {
        facet: "include",
        fill: island,
        x: 1,
        y: () => "include"
      }),
      Plot.frame()
    ]
  });
}
