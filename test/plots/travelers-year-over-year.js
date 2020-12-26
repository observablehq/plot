import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const data = await d3.csv("data/travelers.csv", d3.autoType);
  return Plot.plot({
    y: {
      grid: true,
      nice: true,
      label: "↑ Travelers per day (millions)"
    },
    marks: [
      Plot.ruleY([0]),
      Plot.line(data, {
        x: d => d.date,
        y: d => d.previous / 1e6,
        stroke: "#bab0ab"
      }),
      Plot.line(data, {
        x: d => d.date,
        y: d => d.current / 1e6
      }),
      Plot.text(data.slice(0, 1), {
        x: d => d.date,
        y: d => d.previous / 1e6,
        text: ["2019"],
        fill: "#bab0ab",
        dy: "-0.5em"
      }),
      Plot.text(data.slice(0, 1), {
        x: d => d.date,
        y: d => d.current / 1e6,
        text: ["2020"],
        dy: "-0.5em"
      })
    ]
  });
}
