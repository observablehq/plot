import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

if (import.meta.vitest) {
  await import("../plot.js").then((_) => _.declareTests(import.meta.filename));
}

export async function gistempAnomalyTransform() {
  const data = await d3.csv<any>("data/gistemp.csv", d3.autoType);
  const transform = (c) => (c * 9) / 5; // convert (relative) Celsius to Fahrenheit
  return Plot.plot({
    y: {
      label: "Temperature anomaly (°F)",
      tickFormat: "+f",
      transform,
      grid: true
    },
    color: {
      scheme: "BuRd",
      domain: [-1, 1],
      transform
    },
    marks: [Plot.ruleY([0]), Plot.dot(data, {x: "Date", y: "Anomaly", stroke: "Anomaly"})]
  });
}
