import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function () {
  const gapminder = await d3.tsv("data/gapminder.tsv", d3.autoType);
  const chart = Plot.plot({
    marginLeft: 70,
    inset: 10,
    grid: true,
    x: {
      type: "log",
      transform: d => Math.pow(10, d)
    },
    marks: [
      Plot.boxX(gapminder, {
        x: d => Math.log10(d.gdpPercap),
        y: "continent",
        stroke: "continent",
        strokeWidth: 0.5,
        time: "year"
      })
    ]
  });

  // for CI tests
  chart.snapshots = [1952, 1997.3, 2020];

  // animate on click
  d3.select(chart).on("click", () => chart.paused ? chart.play() : chart.pause());

  return chart;
}
