import * as Plot from "@observablehq/plot";

export default async function () {
  return Plot.plot({
    y: {
      grid: true
    },
    marks: [Plot.barY("ABCDEF"), Plot.ruleY([0])]
  });
}
