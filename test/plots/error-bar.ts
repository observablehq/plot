import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function errorBarX() {
  const alphabet = await d3.csv<any>("data/alphabet.csv", d3.autoType);
  return Plot.plot({
    marks: [
      Plot.barX(alphabet, {x: "frequency", y: "letter", sort: {y: "-x"}, fill: "steelblue"}),
      Plot.ruleY(alphabet, {x1: (d) => d.frequency * 0.9, x2: (d) => d.frequency * 1.1, y: "letter", marker: "tick"}),
      Plot.ruleX([0])
    ]
  });
}

export async function errorBarY() {
  const alphabet = await d3.csv<any>("data/alphabet.csv", d3.autoType);
  return Plot.plot({
    marks: [
      Plot.barY(alphabet, {x: "letter", y: "frequency", sort: {x: "-y"}, fill: "steelblue"}),
      Plot.ruleX(alphabet, {x: "letter", y1: (d) => d.frequency * 0.9, y2: (d) => d.frequency * 1.1, marker: "tick"}),
      Plot.ruleY([0])
    ]
  });
}
