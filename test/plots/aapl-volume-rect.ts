import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

if (import.meta.vitest) {
  await import("../plot.js").then((_) => _.declareTests(import.meta.filename));
}

export async function aaplVolumeRect() {
  const AAPL = (await d3.csv<any>("data/aapl.csv", d3.autoType)).slice(-40);
  return Plot.plot({
    y: {
      grid: true,
      transform: (d) => d / 1e6,
      label: "Daily trade volume (millions)"
    },
    marks: [
      Plot.rectY(AAPL, {x: "Date", interval: "day", y: "Volume", fill: "#ccc"}),
      Plot.ruleY(AAPL, {x: "Date", interval: "day", y: "Volume"}),
      Plot.ruleY([0])
    ]
  });
}
