import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const AAPL = await d3.csv("data/aapl.csv", d3.autoType);
  return Plot.plot({
    y: {
      grid: true
    },
    marks: [
      Plot.areaY(AAPL, Plot.map({y1: bollinger(20, -2), y2: bollinger(20, 2)}, {x: "Date", y: "Close", fillOpacity: 0.2})),
      Plot.line(AAPL, Plot.map({y: bollinger(20, 0)}, {x: "Date", y: "Close", stroke: "blue"})),
      Plot.line(AAPL, {x: "Date", y: "Close", strokeWidth: 1})
    ]
  });
}

function bollinger(N, K) {
  return Plot.window({k: N, reduce: Y => d3.mean(Y) + K * d3.deviation(Y), strict: true, anchor: "end"});
}
