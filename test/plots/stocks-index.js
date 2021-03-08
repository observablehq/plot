import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

const format = d3.format("+d");

function formatChange(x) {
  return format((x - 1) * 100);
}

async function loadSymbol(name) {
  const Symbol = name.toUpperCase();
  return d3.csv(`data/${name}.csv`, d => ({Symbol, ...d3.autoType(d)}));
}

export default async function() {
  const stocks = (await Promise.all(["aapl", "amzn", "goog", "ibm"].map(loadSymbol))).flat();
  return Plot.plot({
    style: "overflow: visible;",
    y: {
      type: "log",
      grid: true,
      label: "↑ Change in price (%)",
      tickFormat: formatChange
    },
    marks: [
      Plot.ruleY([1]),
      Plot.line(stocks, Plot.normalizeY({
        x: "Date",
        y: "Close",
        stroke: "Symbol"
      })),
      Plot.text(stocks, Plot.selectLast(Plot.normalizeY({
        x: "Date",
        y: "Close",
        z: "Symbol",
        text: d => d.Symbol.toUpperCase(),
        textAnchor: "start",
        dx: 3
      })))
    ]
  });
}
