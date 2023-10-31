import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function rectBand() {
  return Plot.plot({
    y: {
      type: "band",
      domain: "ABC",
      grid: true
    },
    marks: [
      Plot.frame(),
      Plot.barX({length: 1}, {x1: [0], x2: [1], fill: "cyan", mixBlendMode: "multiply"}),
      Plot.rectX({length: 1}, {x1: [0], x2: [1], fill: "magenta", mixBlendMode: "multiply"})
    ]
  });
}

export async function rectBandY() {
  const alphabet = await d3.csv<any>("data/alphabet.csv", d3.autoType);
  return Plot.plot({
    y: {type: "band"},
    marks: [Plot.rectX(alphabet, {y: "letter", x: "frequency"})]
  });
}
