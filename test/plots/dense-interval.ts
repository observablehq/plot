import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function denseIntervalAreaY() {
  const aapl = await d3.csv<any>("data/aapl.csv", d3.autoType);
  return Plot.plot({
    marks: [Plot.areaY(aapl, {x: "Date", reduce: "count", interval: "month"})]
  });
}

export async function denseIntervalLineY() {
  const aapl = await d3.csv<any>("data/aapl.csv", d3.autoType);
  return Plot.plot({
    marks: [Plot.lineY(aapl, {x: "Date", reduce: "count", interval: "month"})]
  });
}
