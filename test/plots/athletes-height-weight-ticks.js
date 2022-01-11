import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const athletes = await d3.csv("data/athletes.csv", d3.autoType);
  return Plot.plot({
    x: {grid: d3.range(30, 180, 10)},
    y: {grid: d3.range(1, 2.2, 0.05)},
    height: 640,
    marks: [
      Plot.dot(athletes, {x: "weight", y: "height"})
    ]
  });
}
