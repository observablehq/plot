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

export async function denseIntervalAreaX() {
  return Plot.areaX(
    {length: 1000},
    {
      y: d3.randomNormal.source(d3.randomLcg(42))(),
      reduce: "count",
      interval: 0.5,
      curve: "basis"
    }
  ).plot({width: 200});
}

export async function denseIntervalLineX() {
  return Plot.lineX(
    {length: 1000},
    {
      y: d3.randomNormal.source(d3.randomLcg(42))(),
      reduce: "count",
      interval: 0.5,
      curve: "basis"
    }
  ).plot({width: 200});
}
