import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const athletes = await d3.csv("data/athletes.csv", d3.autoType);
  return Plot.plot({
    grid: true,
    height: 640,
    marks: [
      Plot.dot(athletes, Plot.shuffle({seed: 42, x: "weight", y: "height", fill: "sport"}))
    ]
  });
}
