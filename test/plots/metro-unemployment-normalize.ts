import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function metroUnemploymentNormalize() {
  const data = await d3.csv<any>("data/bls-metro-unemployment.csv", d3.autoType);
  return Plot.plot({
    y: {
      type: "log",
      label: "↑ Change in unemployment (%)",
      grid: true,
      tickFormat: (x) => `${x.toPrecision(1)}×`
    },
    marks: [Plot.line(data, Plot.normalizeY({x: "date", y: "unemployment", z: "division"})), Plot.ruleY([1])]
  });
}
