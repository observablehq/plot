import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const alphabet = await d3.csv("data/alphabet.csv", d3.autoType);
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
