import * as Plot from "@observablehq/plot";

export async function ordinalBar() {
  return Plot.plot({
    y: {
      grid: true
    },
    marks: [Plot.barY("ABCDEF"), Plot.ruleY([0])]
  });
}
