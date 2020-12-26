import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const alphabet = await d3.csv("data/alphabet.csv", d3.autoType);
  return Plot.plot({
    x: {
      label: "Frequency (%) →",
      grid: true
    },
    y: {
      domain: d3.sort(alphabet, (a, b) => d3.descending(a.frequency, b.frequency)).map(d => d.letter),
      invert: true, // TODO implicitly invert when band or point in y
      label: null
    },
    marks: [
      Plot.barX(alphabet, {x: d => d.frequency * 100, y: "letter"}),
      Plot.ruleX([0])
    ],
    height: 580
  });
}
