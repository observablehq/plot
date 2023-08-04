import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function aaplBollinger() {
  const AAPL = await d3.csv<any>("data/aapl.csv", d3.autoType);
  return Plot.plot({
    y: {
      grid: true
    },
    marks: [
      Plot.bollingerY(AAPL, {x: "Date", y: "Close", stroke: "blue"}),
      Plot.line(AAPL, {x: "Date", y: "Close", strokeWidth: 1})
    ]
  });
}

export async function aaplBollingerGridInterval() {
  const AAPL = await d3.csv<any>("data/aapl.csv", d3.autoType);
  return Plot.plot({
    marks: [
      Plot.frame({fill: "#eaeaea"}),
      Plot.gridY({tickSpacing: 35, stroke: "#fff", strokeOpacity: 1, strokeWidth: 0.5}),
      Plot.gridY({tickSpacing: 70, stroke: "#fff", strokeOpacity: 1}),
      Plot.axisY({tickSpacing: 70}),
      Plot.gridX({tickSpacing: 40, stroke: "#fff", strokeOpacity: 1, strokeWidth: 0.5}),
      Plot.gridX({tickSpacing: 80, stroke: "#fff", strokeOpacity: 1}),
      Plot.axisX({tickSpacing: 80}),
      Plot.bollingerY(AAPL, {x: "Date", y: "Close", stroke: "blue"}),
      Plot.line(AAPL, {x: "Date", y: "Close", strokeWidth: 1})
    ]
  });
}

export async function aaplBollingerGridSpacing() {
  const AAPL = await d3.csv<any>("data/aapl.csv", d3.autoType);
  return Plot.plot({
    marks: [
      Plot.frame({fill: "#eaeaea"}),
      Plot.gridY({interval: 10, stroke: "#fff", strokeOpacity: 1, strokeWidth: 0.5}),
      Plot.gridY({interval: 20, stroke: "#fff", strokeOpacity: 1}),
      Plot.axisY({interval: 20}),
      Plot.gridX({interval: "3 months", stroke: "#fff", strokeOpacity: 1, strokeWidth: 0.5}),
      Plot.gridX({interval: "1 year", stroke: "#fff", strokeOpacity: 1}),
      Plot.axisX({interval: "1 year"}),
      Plot.bollingerY(AAPL, {x: "Date", y: "Close", stroke: "blue"}),
      Plot.line(AAPL, {x: "Date", y: "Close", strokeWidth: 1})
    ]
  });
}
