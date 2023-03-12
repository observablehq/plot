import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function penguinAnnotated() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.plot({
    marginLeft: 75,
    x: {insetRight: 10},
    marks: [
      Plot.frame(),
      Plot.barX(
        penguins,
        Plot.groupY({x: "count"}, {y: "species", fill: "sex", title: "sex", sort: {y: "x", reverse: true}})
      ),
      Plot.text(["Count of penguins\ngrouped by species\n and colored by sex"], {
        frameAnchor: "bottom-right",
        dx: -3,
        dy: -3,
        fontStyle: "italic"
      })
    ]
  });
}
