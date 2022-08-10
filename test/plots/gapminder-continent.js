import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const gapminder = await d3.tsv("data/gapminder.tsv", d3.autoType);
  const chart = Plot.plot({
    height: 1200,
    inset: 10,
    grid: true,
    facet: {data: gapminder, y: "continent", marginRight: 70},
    x: {
      type: "log"
    },
    marks: [
      Plot.line(gapminder, {x: "gdpPercap", y: "lifeExp", z: "country", stroke: "continent", strokeWidth: 0.5, time: "year", timeFilter: "lte"}),
      Plot.dot(gapminder, {x: "gdpPercap", y: "lifeExp", r: "pop", stroke: "continent", time: "year"})
    ]
  });

  // for CI tests
  chart.snapshots = [1952, 1997.3, 2020];

  // animate on click
  d3.select(chart).on("click", () => chart.paused ? chart.play() : chart.pause());

  return chart;
}
