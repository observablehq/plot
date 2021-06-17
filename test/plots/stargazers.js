import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const data = await d3.csv("data/stargazers.csv", d3.autoType);
  return Plot.plot({
    marks: [
      Plot.ruleY([0]),
      Plot.line(data, {
        x: "date",
        y: (_,i) => i,
        stroke: "brown",
        strokeWidth: 2.5
      }),
      Plot.text(data, Plot.selectMaxX({
        x: "date",
        y: data.length,
        text: data.length,
        textAnchor: "start",
        dx: 3,
        dy: 6
      }))
    ],
    x: { inset: 20, grid: true },
    y: { type: "linear", nice: true, grid: true }
  });
}
