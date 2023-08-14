import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function aaplClose() {
  const aapl = await d3.csv<any>("data/aapl.csv", d3.autoType);
  return Plot.plot({
    y: {grid: true},
    marks: [
      Plot.areaY(aapl, {x: "Date", y: "Close", fillOpacity: 0.1}),
      Plot.lineY(aapl, {x: "Date", y: "Close"}),
      Plot.ruleY([0])
    ]
  });
}

export async function aaplCloseClip() {
  const aapl = await d3.csv<any>("data/aapl.csv", d3.autoType);
  return Plot.plot({
    clip: true,
    x: {domain: [new Date(Date.UTC(2015, 0, 1)), new Date(Date.UTC(2015, 3, 1))]},
    y: {grid: true},
    marks: [
      Plot.areaY(aapl, {x: "Date", y: "Close", fillOpacity: 0.1}),
      Plot.lineY(aapl, {x: "Date", y: "Close"}),
      Plot.ruleY([0], {clip: false})
    ]
  });
}

export async function aaplCloseDataTicks() {
  const aapl = await d3.csv<any>("data/aapl.csv", d3.autoType);
  return Plot.plot({
    marks: [Plot.axisY(d3.ticks(0, 200, 10), {anchor: "left"}), Plot.lineY(aapl, {x: "Date", y: "Close"})]
  });
}

export async function aaplCloseImplicitGrid() {
  const aapl = await d3.csv<any>("data/aapl.csv", d3.autoType);
  return Plot.plot({
    y: {grid: true}, // appears even though there’s an explicit axis
    marks: [Plot.axisY({anchor: "left"}), Plot.lineY(aapl, {x: "Date", y: "Close"})]
  });
}

export async function aaplCloseGridColor() {
  const aapl = await d3.csv<any>("data/aapl.csv", d3.autoType);
  return Plot.lineY(aapl, {x: "Date", y: "Close"}).plot({y: {grid: "red"}});
}

export async function aaplCloseGridInterval() {
  const aapl = await d3.csv<any>("data/aapl.csv", d3.autoType);
  return Plot.lineY(aapl, {x: "Date", y: "Close"}).plot({x: {grid: "3 months"}});
}

export async function aaplCloseGridIntervalName() {
  const aapl = await d3.csv<any>("data/aapl.csv", d3.autoType);
  return Plot.lineY(aapl, {x: "Date", y: "Close"}).plot({x: {grid: "month"}});
}

export async function aaplCloseGridIterable() {
  const aapl = await d3.csv<any>("data/aapl.csv", d3.autoType);
  return Plot.lineY(aapl, {x: "Date", y: "Close"}).plot({y: {grid: [100, 120, 140]}});
}

export async function aaplCloseNormalize() {
  const aapl = await d3.csv<any>("data/aapl.csv", d3.autoType);
  const x = new Date("2014-01-01");
  const X = Plot.valueof(aapl, "Date");
  return Plot.plot({
    y: {type: "log", grid: true, tickFormat: ".1f"},
    marks: [
      Plot.ruleY([1]),
      Plot.lineY(
        aapl,
        Plot.normalizeY((I, Y) => Y[I.find((i) => X[i] >= x)], {x: X, y: "Close"})
      )
    ]
  });
}
