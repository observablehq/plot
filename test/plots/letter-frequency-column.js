import * as Plot from "@observablehq/plot";
import {csv} from "d3-fetch";
import {autoType} from "d3-dsv";

export default async function() {
  const alphabet = await csv("data/alphabet.csv", autoType);
  return Plot.plot({
    x: {
      label: null
    },
    y: {
      label: "↑ Frequency (%)",
      grid: true
    },
    marks: [
      Plot.barY(alphabet, {x: "letter", y: d => d.frequency * 100}),
      Plot.ruleY([0])
    ]
  });
}
