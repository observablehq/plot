import * as Plot from "@observablehq/plot";
import {csv} from "d3-fetch";
import {autoType} from "d3-dsv";

export default async function() {
  const AAPL = (await csv("data/aapl.csv", autoType)).slice(-120);
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
