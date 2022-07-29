import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function () {
  let gapminder = await d3.tsv("data/gapminder.tsv", d3.autoType);
  gapminder = gapminder.filter(d => d.continent === "Europe");
  return Plot.plot({
    height: 400,
    marginLeft: 75,
    inset: 10,
    grid: true,
    x: {
      type: "log",
      transform: d => Math.pow(10, d)
    },
    marks: [
      Plot.dot(gapminder, Plot.dodgeY({
        x: d => Math.log10(d.gdpPercap),
        z: d => `${d.year} & ${d.continent}`,
        r: "pop",
        stroke: "continent",
        sort: null
//        time: "year"
      })),
      Plot.dot(gapminder, Plot.dodgeY({
        x: d => Math.log10(d.gdpPercap),
        z: d => `${d.year} & ${d.continent}`,
        r: "pop",
        fill: "continent",
        sort: null,
        fillOpacity: 0.3,
        strokeWidth: 0.5,
        time: "year"
      })),
      void Plot.text(gapminder, {frameAnchor: "top-left", text: "year", time: "year"})
//      Plot.text(gapminder, Plot.selectFirst({frameAnchor: "top-left", text: "year", time: "year"}))

    ]
  });
}
