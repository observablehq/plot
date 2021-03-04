import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const data = await d3.csv("data/travelers.csv", d3.autoType);
  return Plot.plot({
    y: {
      grid: true,
      nice: true,
      label: "↑ Travelers per day (millions)",
      transform: d => d / 1e6
    },
    marks: [
      Plot.ruleY([0]),
      Plot.line(data, {
        x: "date",
        y: "previous",
        stroke: "#bab0ab"
      }),
      Plot.line(data, {
        x: "date",
        y: "current"
      }),
      Plot.text(data.slice(0, 1), {
        x: "date",
        y: "previous",
        text: ["2019"],
        fill: "#bab0ab",
        dy: "-0.5em"
      }),
      Plot.text(data.slice(0, 1), {
        x: "date",
        y: "current",
        text: ["2020"],
        dy: "1.2em"
      })
    ]
  });
}
