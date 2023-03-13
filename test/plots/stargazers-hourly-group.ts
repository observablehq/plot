import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function stargazersHourlyGroup() {
  const stargazers = await d3.csv<any>("data/stargazers.csv", d3.autoType);
  return Plot.plot({
    x: {
      label: "New stargazers per hour →",
      tickFormat: (d) => (d > 10 ? "" : d === 10 ? "10+" : d)
    },
    y: {
      grid: true
    },
    marks: [
      Plot.rectY(
        stargazers,
        Plot.binX(
          {y: "count", interval: 1},
          Plot.binX(
            {x: (d) => Math.min(10, d.length), title: "first", thresholds: "hour"},
            {x: "date", fill: (d) => d.date.getUTCDay(), title: (d) => "SMTWTFS"[d.date.getUTCDay()]}
          )
        )
      ),
      Plot.ruleY([0])
    ]
  });
}
