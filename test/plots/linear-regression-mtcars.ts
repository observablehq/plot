import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function linearRegressionMtcars() {
  const mtcars = await d3.csv<any>("data/mtcars.csv", d3.autoType);
  return Plot.plot({
    marks: [
      Plot.dot(mtcars, {x: "wt", y: "hp", r: 2}),
      Plot.linearRegressionY(mtcars, {x: "wt", y: "hp", stroke: null, ci: 0.8}),
      Plot.linearRegressionY(mtcars, {x: "wt", y: "hp"})
    ]
  });
}
