import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

if (import.meta.vitest) {
  await import("../plot.js").then((_) => _.declareTests(import.meta.filename));
}

export async function aaplCloseUntyped() {
  const AAPL = await d3.csv<any>("data/aapl.csv");
  return Plot.plot({
    x: {
      type: "utc"
    },
    y: {
      type: "linear",
      grid: true
    },
    marks: [Plot.line(AAPL, {x: "Date", y: "Close"}), Plot.ruleY([0])]
  });
}
