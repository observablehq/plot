import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function () {
  const aapl = await d3.csv("data/aapl.csv");
  return Plot.plot({
    y: {
      transform: (d) => d / 1e6
    },
    marks: [Plot.rectY(aapl, Plot.binX({y: "sum"}, {x: "Date", thresholds: "month", y: "Volume"})), Plot.ruleY([0])]
  });
}
