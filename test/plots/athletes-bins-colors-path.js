import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function () {
  const athletes = await d3.csv("data/athletes.csv", d3.autoType);
  return Plot.plot({
    marks: [
      Plot.rectPathY(athletes, Plot.binX({fill: "x", y: "count"}, {x: "weight", borderTopRadius: 5})),
      Plot.ruleY([0])
    ]
  });
}
