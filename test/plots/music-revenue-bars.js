import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function () {
  const data = await d3.csv("data/riaa-us-revenue.csv", d3.autoType);
  const stack = {x: (d) => d["year"].getUTCFullYear(), y: "revenue", z: "format", order: "value", reverse: true};
  return Plot.plot({
    marginRight: 90,
    marginBottom: 35,
    facet: {data, y: "group", marginRight: 90},
    x: {ticks: d3.range(1975, 2020, 5), tickFormat: ""},
    y: {
      grid: true,
      label: "↑ Annual revenue (billions, adj.)",
      transform: (d) => d / 1000,
      nice: true
    },
    marks: [
      Plot.frame(),
      Plot.barY(
        data,
        Plot.groupX(
          {y: "sum"},
          Plot.windowY({
            ...stack,
            k: 3,
            y: (d) => -d.revenue,
            fill: "group",
            facet: "exclude",
            order: "sum"
          })
        )
      ),
      Plot.barY(
        data,
        Plot.groupX(
          {y: "sum"},
          Plot.windowY({
            ...stack,
            k: 3,
            fill: "group",
            title: (d) => `${d.format}\n${d.group}`
          })
        )
      ),
      Plot.ruleY([0])
    ]
  });
}
