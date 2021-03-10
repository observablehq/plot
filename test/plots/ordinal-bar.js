import * as Plot from "@observablehq/plot";

export default async function() {
  return Plot.plot({
    y: {
      grid: true
    },
    marks: [
      Plot.barY("ABCDEF", {x: (d, i) => i}),
      Plot.ruleY([0])
    ]
  });
}
