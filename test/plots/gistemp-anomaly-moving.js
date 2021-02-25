import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const data = await d3.csv("data/gistemp.csv", d3.autoType);
  return Plot.plot({
    x: {
      label: null
    },
    y: {
      label: "↑ Temperature anomaly (°C)",
      tickFormat: "+f",
      grid: true
    },
    color: {
      type: "diverging"
    },
    marks: [
      Plot.ruleY([0]),
      Plot.dot(data, {x: "Date", y: "Anomaly", stroke: "Anomaly"}),
      Plot.line(data, {x: "Date", y: Plot.movingAverage(24, "Anomaly")})
    ]
  });
}
