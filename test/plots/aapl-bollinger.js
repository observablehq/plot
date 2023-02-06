import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function aaplBollinger() {
  const AAPL = await d3.csv("data/aapl.csv", d3.autoType);
  return Plot.plot({
    y: {
      grid: true
    },
    marks: [
      Plot.areaY(AAPL, bollingerBandY(20, 2, {x: "Date", y: "Close", fillOpacity: 0.2})),
      Plot.line(AAPL, Plot.map({y: bollinger(20, 0)}, {x: "Date", y: "Close", stroke: "blue"})),
      Plot.line(AAPL, {x: "Date", y: "Close", strokeWidth: 1})
    ]
  });
}

export async function aaplBollingerGridInterval() {
  const AAPL = await d3.csv("data/aapl.csv", d3.autoType);
  return Plot.plot({
    marks: [
      Plot.frame({fill: "#eaeaea"}),
      Plot.gridY({tickSpacing: 35, stroke: "#fff", strokeOpacity: 1, strokeWidth: 0.5}),
      Plot.gridY({tickSpacing: 70, stroke: "#fff", strokeOpacity: 1}),
      Plot.axisY({tickSpacing: 70}),
      Plot.gridX({tickSpacing: 40, stroke: "#fff", strokeOpacity: 1, strokeWidth: 0.5}),
      Plot.gridX({tickSpacing: 80, stroke: "#fff", strokeOpacity: 1}),
      Plot.axisX({tickSpacing: 80}),
      Plot.areaY(AAPL, bollingerBandY(20, 2, {x: "Date", y: "Close", fillOpacity: 0.2})),
      Plot.line(AAPL, Plot.map({y: bollinger(20, 0)}, {x: "Date", y: "Close", stroke: "blue"})),
      Plot.line(AAPL, {x: "Date", y: "Close", strokeWidth: 1})
    ]
  });
}

export async function aaplBollingerGridSpacing() {
  const AAPL = await d3.csv("data/aapl.csv", d3.autoType);
  return Plot.plot({
    marks: [
      Plot.frame({fill: "#eaeaea"}),
      Plot.gridY({interval: 10, stroke: "#fff", strokeOpacity: 1, strokeWidth: 0.5}),
      Plot.gridY({interval: 20, stroke: "#fff", strokeOpacity: 1}),
      Plot.axisY({interval: 20}),
      Plot.gridX({interval: d3.utcMonth.every(3), stroke: "#fff", strokeOpacity: 1, strokeWidth: 0.5}),
      Plot.gridX({interval: d3.utcYear, stroke: "#fff", strokeOpacity: 1}),
      Plot.axisX({interval: d3.utcYear}),
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
