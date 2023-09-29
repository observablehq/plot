import * as Plot from "@observablehq/plot";

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
