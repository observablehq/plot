import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function simpsonsRatingsDots() {
  const simpsons = await d3.csv<any>("data/simpsons.csv", d3.autoType);
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
      Plot.ruleX(simpsons, Plot.groupX({y1: "min", y2: "max"}, {x: "season", y: "imdb_rating"})),
      Plot.line(simpsons, Plot.groupX({y: "median"}, {x: "season", y: "imdb_rating", stroke: "red"})),
      Plot.dot(simpsons, {x: "season", y: "imdb_rating"})
    ]
  });
}
