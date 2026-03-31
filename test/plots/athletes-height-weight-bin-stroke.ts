import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

if (import.meta.vitest) {
  await import("../plot.js").then((_) => _.declareTests(import.meta.filename));
}

export async function athletesHeightWeightBinStroke() {
  const athletes = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.plot({
    round: true,
    grid: true,
    height: 640,
    y: {
      ticks: 10
    },
    color: {
      scheme: "YlGnBu"
    },
    marks: [
      Plot.rect(athletes, Plot.bin({fill: "count"}, {x: "weight", y: "height", thresholds: 50})),
      Plot.rect(
        athletes,
        Plot.bin({filter: (d) => d.length > 20}, {x: "weight", y: "height", stroke: "grey", inset: 0, thresholds: 50})
      )
    ]
  });
}
