import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

const format = d3.format("+d");

function formatChange(x) {
  return format((x - 1) * 100);
}

export default async function() {
  const stocks = (await Promise.all(["aapl", "amzn", "goog", "ibm"].map(async symbol => {
      return [symbol.toUpperCase(), await d3.csv(`data/${symbol}.csv`, d3.autoType)];
    }))).flatMap(([symbol, data]) => {
      const [{Close: basis}] = data;
      return data.map(({Date, Close}) => ({
        symbol,
        date: Date,
        multiple: Close / basis
      }));
    });
  return Plot.plot({
    style: "overflow: visible;",
    x: {
      label: null
    },
    y: {
      type: "log",
      grid: true,
      label: "↑ Change in price (%)",
      tickFormat: formatChange
    },
    marks: [
      Plot.ruleY([1]),
      Plot.line(stocks, {
        x: "date",
        y: "multiple",
        stroke: "symbol"
      }),
      Plot.text(stocks, Plot.selectLast({
        x: "date",
        y: "multiple",
        z: "symbol",
        text: "symbol",
        textAnchor: "start",
        dx: 3
      }))
    ]
  });
}
