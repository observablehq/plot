import * as Plot from "@observablehq/plot";
import {csv} from "d3-fetch";
import {autoType} from "d3-dsv";

export default async function() {
  const data = await csv("data/gistemp.csv", autoType);
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
      Plot.dot(data, {x: "Date", y: "Anomaly", stroke: "Anomaly"})
    ]
  });
}
