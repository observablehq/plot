import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

// A channel of explicit symbols does not show in the tip nor has a legend.
export async function explicitSymbol() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.dot(
    penguins,
    Plot.dodgeY({
      x: "culmen_length_mm",
      symbol: (d) => (d.sex === "FEMALE" ? "square" : "star"),
      tip: true
    })
  ).plot({height: 220, symbol: {legend: true}});
}
