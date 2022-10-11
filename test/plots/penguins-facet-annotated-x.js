import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function () {
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  return Plot.plot({
    marginLeft: 75,
    x: {insetRight: 10},
    marks: [
      Plot.frame(),
      Plot.barX(
        penguins,
        Plot.groupY(
          {x: "count"},
          {
            y: "species",
            fill: "sex",
            fx: "island"
          }
        )
      ),
      Plot.text(["Torgersen Island\nonly has\nAdelie\npenguins!"], {
        frameAnchor: "right",
        dx: -10,
        fx: ["Torgersen"]
      })
    ]
  });
}
