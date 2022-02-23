import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const movies = await d3.json("data/movies.json");
  const Genre = d => d["Major Genre"] || "Other";
  const Profit = d => (d["Worldwide Gross"] - d["Production Budget"]) / 1e6;
  return Plot.plot({
    marginLeft: 120,
    x: {
      grid: true,
      inset: 6,
      label: "Profit ($M) →",
      domain: [d3.min(movies, Profit), 1e3]
    },
    marks: [
      Plot.ruleX([0]),
      Plot.barX(movies, Plot.groupY({x1: "p25", x2: "p75"}, {
        y: Genre,
        x: Profit,
        fillOpacity: 0.2
      })),
      Plot.dot(movies, {
        y: Genre,
        x: Profit,
        strokeWidth: 1
      }),
      Plot.tickX(movies, Plot.groupY({x: "median"}, {
        y: Genre,
        x: Profit,
        stroke: "red",
        strokeWidth: 2,
        sort: {y: "x", reverse: true}
      }))
    ]
  });
}
