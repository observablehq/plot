import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function penguinFacetAnnotated() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.plot({
    marginLeft: 75,
    facet: {marginRight: 70},
    marks: [
      Plot.frame(),
      Plot.barX(penguins, Plot.groupY({x: "count"}, {fy: "island", y: "species", fill: "sex"})),
      Plot.text(["Torgersen Island only has Adelie penguins!"], {
        fy: ["Torgersen"],
        frameAnchor: "top-right",
        dy: 4,
        dx: -4
      })
    ]
  });
}
