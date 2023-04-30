import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function intervalTransformBin() {
  const olympians = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.plot({
    x: {interval: 10},
    marks: [Plot.barY(olympians, Plot.binY({fill: "count"}, {x: "weight", y: "height", inset: 0}))]
  });
}

export async function intervalTransformGroup() {
  const olympians = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.plot({
    x: {tickFormat: "%Y", interval: "5 years"},
    marks: [Plot.barY(olympians, Plot.groupX({y: "count"}, {x: "date_of_birth"}))]
  });
}

export async function intervalTransformStack() {
  const olympians = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.plot({
    x: {tickFormat: "%Y", interval: "5 years"},
    marks: [Plot.barY(olympians, {x: "date_of_birth", y: 1})]
  });
}
