import * as Plot from "@observablehq/plot";
import {csv} from "d3-fetch";
import {autoType} from "d3-dsv";

export default async function() {
  const AAPL = await csv("data/aapl.csv", autoType);
  return Plot.plot({
    y: {
      grid: true
    },
    marks: [
      Plot.areaY(AAPL, {x: "Date", y: "Close", fillOpacity: 0.1}),
      Plot.line(AAPL, {x: "Date", y: "Close"}),
      Plot.ruleY([0])
    ]
  });
}
