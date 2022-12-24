import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function () {
  const AAPL = await d3.csv("data/aapl.csv", d3.autoType);
  return Plot.plot({
    axis: null,
    margin: 20,
    marginLeft: 40,
    marginBottom: 30,
    height: 400,
    marks: [
      Plot.axisX(),
      Plot.axisY({grid: true}),
      Plot.text(["↑ Close"], {frameAnchor: "top-left", textAnchor: "end", dy: -17, dx: -2}), // TODO
      Plot.areaY(AAPL, bollingerBandY(20, 2, {x: "Date", y: "Close", fillOpacity: 0.2})),
      Plot.line(AAPL, Plot.map({y: bollinger(20, 0)}, {x: "Date", y: "Close", stroke: "blue"})),
      Plot.line(AAPL, {x: "Date", y: "Close", strokeWidth: 1})
    ]
  });
}

function bollingerBandY(N, K, options) {
  return Plot.map({y1: bollinger(N, -K), y2: bollinger(N, K)}, options);
}

function bollinger(N, K) {
  return Plot.window({k: N, reduce: (Y) => d3.mean(Y) + K * d3.deviation(Y), strict: true, anchor: "end"});
}
