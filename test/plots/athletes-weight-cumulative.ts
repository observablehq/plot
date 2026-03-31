import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

if (import.meta.vitest) {
  await import("../plot.js").then((_) => _.declareTests(import.meta.filename));
}

export async function athletesWeightCumulative() {
  const athletes = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.plot({
    marginLeft: 44,
    marks: [Plot.rectY(athletes, Plot.binX({y: "count"}, {x: "weight", cumulative: true}))]
  });
}
