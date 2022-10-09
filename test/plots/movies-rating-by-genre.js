import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function () {
  const movies = await d3.json("data/movies.json");
  return Plot.plot({
    width: 960,
    height: 560,
    x: {
      axis: "top",
      grid: true,
      domain: [0, 10]
    },
    fy: {
      grid: true,
      tickFormat: (d) => d ?? "N/A",
      label: null,
      padding: 0
    },
    facet: {
      data: movies,
      y: "Major Genre",
      marginLeft: 120
    },
    marks: [
      Plot.dot(
        movies,
        Plot.dodgeY(
          {
            anchor: "middle",
            padding: -2
          },
          {
            x: "IMDB Rating",
            stroke: "Major Genre",
            r: 2.5,
            sort: {
              fy: "x",
              reduce: "median",
              reverse: true
            }
          }
        )
      )
    ]
  });
}
