import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

const format = d3.format("+d");

function formatChange(x) {
  return format((x - 1) * 100);
}

export default async function() {
  const [aapl, amzn, goog, ibm] = await Promise.all([
    d3.csv("data/aapl.csv", d3.autoType),
    d3.csv("data/amzn.csv", d3.autoType),
    d3.csv("data/goog.csv", d3.autoType),
    d3.csv("data/ibm.csv", d3.autoType)
  ]);
  const stocks = [["AAPL", aapl], ["AMZN", amzn], ["GOOG", goog], ["IBM", ibm]]
    .flatMap(([symbol, data]) => {
      const [{Close: basis}] = data;
      return data.map(({Date, Close}) => ({
        symbol,
        date: Date,
        multiple: Close / basis
      }));
    });
  return Plot.plot({
    style: {
      overflow: "visible"
    },
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
