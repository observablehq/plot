import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function binFillFirstEmpty() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.rectY(
    penguins,
    Plot.binX(
      {
        y: "count",
        filter: null // retain empty bins
      },
      {
        x: "body_mass_g",
        z: null, // don’t group and stack
        fill: "sex", // use the first sex value to color each bin
        interval: 50, // force empty bins
        insetTop: -0.5, // make empty bins visible
        insetBottom: -0.5 // make empty bins visible
      }
    )
  ).plot({color: {legend: true}});
}
