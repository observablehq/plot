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
      Plot.ruleX(simpsons, Plot.groupX({x: "season", y: "imdb_rating", reduce: {y1: "min", y2: "max"}})),
      Plot.line(simpsons, Plot.groupX({x: "season", y: "imdb_rating", stroke: "red", reduce: {y: "median"}})),
      Plot.dot(simpsons, {x: "season", y: "imdb_rating"})
    ]
  });
}
