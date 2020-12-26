import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const movies = await d3.json("data/movies.json");
  const Genre = d => d["Major Genre"] || "Other";
  const Profit = d => (d["Worldwide Gross"] - d["Production Budget"]) / 1e6;
  const genres = d3.group(movies, Genre);
  return Plot.plot({
    marginLeft: 120,
    x: {
      grid: true,
      inset: 6,
      label: "Profit ($M) →",
      domain: [d3.min(movies, Profit), 1e3]
    },
    y: {
      domain: d3.rollups(movies, movies => d3.median(movies, Profit), Genre)
        .sort(([, a], [, b]) => d3.descending(a, b))
        .map(([key]) => key)
    },
    marks: [
      Plot.ruleX([0]),
      Plot.barX(genres, {
        y: ([genre]) => genre,
        x1: ([, movies]) => d3.quantile(movies, 0.25, Profit),
        x2: ([, movies]) => d3.quantile(movies, 0.75, Profit),
        fillOpacity: 0.2
      }),
      Plot.dot(movies, {
        y: Genre,
        x: Profit,
        strokeWidth: 1
      }),
      Plot.tickX(genres, {
        y: ([genre]) => genre,
        x: ([, movies]) => d3.median(movies, Profit),
        stroke: "red",
        strokeWidth: 2
      })
    ]
  });
}
