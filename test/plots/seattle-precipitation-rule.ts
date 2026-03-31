import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

if (import.meta.vitest) {
  await import("../plot.js").then((_) => _.declareTests(import.meta.filename));
}

export async function seattlePrecipitationRule() {
  const data = await d3.csv<any>("data/seattle-weather.csv", d3.autoType);
  return Plot.ruleX(data, {x: "date", strokeOpacity: "precipitation"}).plot();
}
