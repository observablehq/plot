import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

if (import.meta.vitest) {
  await import("../plot.js").then((_) => _.declareTests(import.meta.filename));
}

export async function aaplVolume() {
  const data = await d3.csv<any>("data/aapl.csv", d3.autoType);
  return Plot.plot({
    x: {
      round: true,
      label: "Trade volume (log₁₀)"
    },
    y: {
      grid: true,
      percent: true
    },
    marks: [Plot.rectY(data, Plot.binX({y: "proportion"}, {x: (d) => Math.log10(d.Volume)})), Plot.ruleY([0])]
  });
}
