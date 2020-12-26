import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const alphabet = await d3.csv("data/alphabet.csv", d3.autoType);
  return Plot.plot({
    y: {
      grid: true
    },
    marks: [
      Plot.ruleX(alphabet, {x: "letter", y: "frequency"}),
      Plot.dot(alphabet, {x: "letter", y: "frequency", fill: "currentColor"}),
      Plot.ruleY([0])
    ]
  });
}
