import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function () {
  const gapminder = await d3.tsv("data/gapminder.tsv", d3.autoType);

  // augment the data with countries for all continents with 0 population
  // and every order of magnitude of gdpPercap, in order to avoid empty bars
  const interval = 0.2; // powers of ten
  for (const [continent, years] of d3.group(
    gapminder,
    (d) => d.continent,
    (d) => d.year
  )) {
    for (const [year] of years) {
      for (const m of d3.range(3 - interval, 5, interval)) {
        gapminder.push({
          pop: 0,
          gdpPercap: 10 ** m,
          continent,
          year
        });
      }
    }
  }

  return Plot.plot({
    inset: 10,
    grid: true,
    x: {
      type: "log",
      transform: (d) => 10 ** d
    },
    y: {
      label: "↑ population (millions)",
      transform: (d) => d * 1e-6
    },
    color: { legend: true },
    marks: [
      Plot.rectY(
        gapminder,
        Plot.binX(
          {
            y: "sum",
            interval
          },
          {
            x: (d) => Math.log10(d.gdpPercap),
            y: "pop",
            fill: "continent",
            time: "year",
            order: "sum"
          }
        )
      )
    ]
  });
}
