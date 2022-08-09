import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const gapminder = await d3.tsv("data/gapminder.tsv", d3.autoType);
  return Plot.plot({
    inset: 10,
    grid: true,
    x: {
      type: "log",
      transform: d => 10 ** d
    },
    y: {
      label: "↑ population (millions)",
      transform: d => d * 1e-6
    },
    color: {legend: true},
    marks: [
      Plot.rectY(gapminder, Plot.binX({y: "sum"}, {x: d => Math.log10(d.gdpPercap), y: "pop", fill: "continent", time: "year", order: "sum", filter: null}))
    ]
  });
}
