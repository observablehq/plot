import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const data = await d3.csv("data/gistemp.csv", d3.autoType);
  return Plot.plot({
    y: {
      label: "↑ Temperature anomaly (°C)",
      tickFormat: "+f",
      grid: true
    },
    color: {
      type: "diverging",
      scheme: "BuRd"
    },
    marks: [
      Plot.ruleY([0]),
      Plot.dot(data, {x: "Date", y: "Anomaly", stroke: "Anomaly"}),
      Plot.line(data, Plot.movingAverageY({x: "Date", y: "Anomaly", k: 24}))
    ]
  });
}
