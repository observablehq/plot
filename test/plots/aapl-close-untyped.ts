import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function aaplCloseUntyped() {
  const AAPL = await d3.csv<any>("data/aapl.csv");
  return Plot.plot({
    x: {
      type: "utc"
    },
    y: {
      type: "linear",
      grid: true
    },
    marks: [Plot.line(AAPL, {x: "Date", y: "Close"}), Plot.ruleY([0])]
  });
}
