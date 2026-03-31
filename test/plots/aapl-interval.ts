import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

if (import.meta.vitest) {
  await import("../plot.js").then((_) => _.declareTests(import.meta.filename));
}

export async function aaplInterval() {
  const aapl = await d3.csv<any>("data/aapl.csv", d3.autoType);
  return Plot.areaY(aapl.slice(0, 81), {x: "Date", y1: "Low", y2: "High", interval: "day", curve: "step"}).plot();
}
