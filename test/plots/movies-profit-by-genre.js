import * as Plot from "@observablehq/plot";
import {descending, group, median, min, quantile, rollups} from "d3-array";
import {json} from "d3-fetch";

export default async function() {
  const movies = await json("data/movies.json");
  const Genre = d => d["Major Genre"] || "Other";
  const Profit = d => (d["Worldwide Gross"] - d["Production Budget"]) / 1e6;
  const genres = group(movies, Genre);
  return Plot.plot({
    marginLeft: 120,
    x: {
      grid: true,
      inset: 6,
      label: "Profit ($M) →",
      domain: [min(movies, Profit), 1e3]
    },
    y: {
      domain: rollups(movies, movies => median(movies, Profit), Genre)
        .sort(([, a], [, b]) => descending(a, b))
        .map(([key]) => key)
    },
    marks: [
      Plot.ruleX([0]),
      Plot.barX(genres, {
        y: ([genre]) => genre,
        x1: ([, movies]) => quantile(movies, 0.25, Profit),
        x2: ([, movies]) => quantile(movies, 0.75, Profit),
        fillOpacity: 0.2
      }),
      Plot.dot(movies, {
        y: Genre,
        x: Profit,
        strokeWidth: 1
      }),
      Plot.tickX(genres, {
        y: ([genre]) => genre,
        x: ([, movies]) => median(movies, Profit),
        stroke: "red",
        strokeWidth: 2
      })
    ]
  });
}
