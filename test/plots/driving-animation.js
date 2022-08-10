import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const driving = await d3.csv("data/driving.csv", d3.autoType);
  const chart = Plot.plot({
    inset: 10,
    grid: true,
    marks: [
      Plot.line(driving, {x: "miles", y: "gas", time: "year", timeFilter: "lte"})
    ]
  });

  // for CI tests
  chart.snapshots = [2009.3];

  // animate on click
  d3.select(chart).on("click", () => chart.paused ? chart.play() : chart.pause());

  return chart;
}
