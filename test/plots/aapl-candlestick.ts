import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function aaplCandlestick() {
  const AAPL = (await d3.csv<any>("data/aapl.csv", d3.autoType)).slice(-120);
  return Plot.plot({
    width: 960,
    inset: 6,
    grid: true,
    y: {
      label: "↑ Apple stock price ($)",
      fontVariant: null
    },
    color: {
      range: ["#e41a1c", "#000000", "#4daf4a"]
    },
    marks: [
      Plot.ruleX(AAPL, {
        x: "Date",
        y1: "Low",
        y2: "High"
      }),
      Plot.ruleX(AAPL, {
        x: "Date",
        y1: "Open",
        y2: "Close",
        stroke: (d) => Math.sign(d.Close - d.Open),
        strokeWidth: 4,
        strokeLinecap: "round"
      })
    ]
  });
}
