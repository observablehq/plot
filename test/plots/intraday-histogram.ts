import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

if (import.meta.vitest) {
  await import("../plot.js").then((_) => _.declareTests(import.meta.filename));
}

export async function intradayHistogram() {
  const timestamps = await d3.csv<any>("data/timestamps.csv", d3.autoType);
  return Plot.plot({
    marks: [Plot.rectY(timestamps, Plot.binX({y: "count"}, {x: (d) => d.timestamp.getUTCHours(), interval: 1}))]
  });
}
