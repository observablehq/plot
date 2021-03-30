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
      domain: d3.sort(alphabet, d => -d.frequency).map(d => d.letter),
      reverse: true, // TODO implicitly reverse when band or point in y
      label: null
    },
    marks: [
      Plot.barX(alphabet, {x: "frequency", y: "letter"}),
      Plot.ruleX([0])
    ],
    height: 580
  });
}
