import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const alphabet = await d3.csv("data/alphabet.csv", d3.autoType);
  return Plot.plot({
    x: {
      label: "Frequency (%) →",
      transform: x => x * 100,
      grid: true
    },
    y: {
      label: null
    },
    marks: [
      Plot.barX(alphabet, {x: "frequency", y: "letter", sort: {y: "x"}}),
      Plot.ruleX([0])
    ],
    height: 580
  });
}
