import * as Plot from "@observablehq/plot";
import {csv} from "d3-fetch";
import {autoType} from "d3-dsv";

export default async function() {
  const data = await csv("data/travelers.csv", autoType);
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
