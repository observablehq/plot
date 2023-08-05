import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function aaplBollinger() {
  const aapl = await d3.csv<any>("data/aapl.csv", d3.autoType);
  return Plot.plot({
    y: {
      grid: true
    },
    marks: [
      Plot.bollingerY(aapl, {x: "Date", y: "Close", stroke: "blue"}),
      Plot.line(aapl, {x: "Date", y: "Close", strokeWidth: 1})
    ]
  });
}

export async function aaplBollingerGridInterval() {
  const aapl = await d3.csv<any>("data/aapl.csv", d3.autoType);
  return Plot.plot({
    marks: [
      Plot.frame({fill: "#eaeaea"}),
      Plot.gridY({tickSpacing: 35, stroke: "#fff", strokeOpacity: 1, strokeWidth: 0.5}),
      Plot.gridY({tickSpacing: 70, stroke: "#fff", strokeOpacity: 1}),
      Plot.axisY({tickSpacing: 70}),
      Plot.gridX({tickSpacing: 40, stroke: "#fff", strokeOpacity: 1, strokeWidth: 0.5}),
      Plot.gridX({tickSpacing: 80, stroke: "#fff", strokeOpacity: 1}),
      Plot.axisX({tickSpacing: 80}),
      Plot.bollingerY(aapl, {x: "Date", y: "Close", stroke: "blue"}),
      Plot.line(aapl, {x: "Date", y: "Close", strokeWidth: 1})
    ]
  });
}

export async function aaplBollingerGridSpacing() {
  const aapl = await d3.csv<any>("data/aapl.csv", d3.autoType);
  return Plot.plot({
    marks: [
      Plot.frame({fill: "#eaeaea"}),
      Plot.gridY({interval: 10, stroke: "#fff", strokeOpacity: 1, strokeWidth: 0.5}),
      Plot.gridY({interval: 20, stroke: "#fff", strokeOpacity: 1}),
      Plot.axisY({interval: 20}),
      Plot.gridX({interval: "3 months", stroke: "#fff", strokeOpacity: 1, strokeWidth: 0.5}),
      Plot.gridX({interval: "1 year", stroke: "#fff", strokeOpacity: 1}),
      Plot.axisX({interval: "1 year"}),
      Plot.bollingerY(aapl, {x: "Date", y: "Close", stroke: "blue"}),
      Plot.line(aapl, {x: "Date", y: "Close", strokeWidth: 1})
    ]
  });
}

export async function aaplBollingerCandlestick() {
  const aapl = await d3.csv<any>("data/aapl.csv", d3.autoType);
  return Plot.plot({
    x: {domain: [new Date("2014-01-01"), new Date("2014-06-01")]},
    y: {domain: [68, 92], grid: true},
    color: {domain: [-1, 0, 1], range: ["red", "black", "green"]},
    marks: [
      Plot.bollingerY(aapl, {x: "Date", y: "Close", stroke: "none", clip: true}),
      Plot.ruleX(aapl, {x: "Date", y1: "Low", y2: "High", strokeWidth: 1, clip: true}),
      Plot.ruleX(aapl, {
        x: "Date",
        y1: "Open",
        y2: "Close",
        strokeWidth: 3,
        stroke: (d) => Math.sign(d.Close - d.Open),
        clip: true
      })
    ]
  });
}
