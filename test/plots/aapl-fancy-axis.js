import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function () {
  const AAPL = await d3.csv("data/aapl.csv", d3.autoType);
  return Plot.plot({
    marks: [
      Plot.ruleY([0]),
      Plot.line(AAPL, {x: "Date", y: "Close"}),
      Plot.axisY({grid: true, x: (y) => AAPL.find((d) => d.Close >= y)?.Date, insetLeft: -6, textStroke: "white"})
    ]
  });
}
