import * as Plot from "@observablehq/plot";

export default async function() {
  return Plot.plot({
    y: {
      grid: true
    },
    marks: [
      Plot.barY("ABCDEF", {x: (d, i) => i, y2: d => d}),
      Plot.ruleY([0])
    ]
  });
}
