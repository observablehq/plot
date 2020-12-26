import * as Plot from "@observablehq/plot";
import {csv} from "d3-fetch";
import {autoType} from "d3-dsv";

export default async function() {
  const alphabet = await csv("data/alphabet.csv", autoType);
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
