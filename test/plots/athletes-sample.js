import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const athletes = await d3.csv("data/athletes.csv", d3.autoType);
  return Plot.plot({
    x: {
      grid: true
    },
    facet: {
      data: athletes,
      marginLeft: 100,
      y: "sport"
    },
    marks: [
      Plot.dotX(athletes, Plot.select(I => I.filter((d, j) => j % 100 === 0), {x: "weight", fill: "sex", r: 5, title: "name"}))
    ],
    color: {scheme: "dark2"}
  });
}
