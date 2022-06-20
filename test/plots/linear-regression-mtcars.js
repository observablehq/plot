import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function () {
  const mtcars = await d3.csv("data/mtcars.csv", d3.autoType);
  return Plot.plot({
    marks: [
      Plot.dot(mtcars, {x: "wt", y: "hp", r: 2}),
      Plot.linearRegressionY(mtcars, {x: "wt", y: "hp", stroke: null, ci: 0.8}),
      Plot.linearRegressionY(mtcars, {x: "wt", y: "hp"})
    ]
  });
}
