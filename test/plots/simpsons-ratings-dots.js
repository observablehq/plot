import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const simpsons = await d3.csv("data/simpsons.csv", d3.autoType);
  return Plot.plot({
    x: {
      type: "point",
      label: "Season →",
      labelAnchor: "right"
    },
    y: {
      label: "↑ IMDb rating"
    },
    marks: [
      Plot.ruleX(simpsons, Plot.reduceY({y1: "min", y2: "max"}, {x: "season", y: "imdb_rating"})),
      Plot.line(simpsons, Plot.reduceY({y: "median"}, {x: "season", y: "imdb_rating", stroke: "red"})),
      Plot.dot(simpsons, {x: "season", y: "imdb_rating"})
    ]
  });
}
