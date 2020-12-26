import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const AAPL = (await d3.csv("data/aapl.csv", d3.autoType)).slice(-120);
  return Plot.plot({
    inset: 6,
    grid: true,
    x: {
      label: null
    },
    y: {
      label: "↑ Apple stock price ($)"
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
        stroke: d => Math.sign(d.Close - d.Open),
        strokeWidth: 4,
        strokeLinecap: "round"
      })
    ],
    width: 960
  });
}
