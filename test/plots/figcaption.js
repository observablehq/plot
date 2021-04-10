import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const alphabet = await d3.csv("data/alphabet.csv", d3.autoType);
  return Plot.plot({
    caption: "The relative frequency of letters in the English language. Data: Robert Edward Lewand",
    x: {
      label: null
    },
    y: {
      label: "↑ Frequency (%)",
      transform: y => y * 100,
      grid: true
    },
    marks: [
      Plot.barY(alphabet, {x: "letter", y: "frequency"}),
      Plot.ruleY([0])
    ]
  });
}
