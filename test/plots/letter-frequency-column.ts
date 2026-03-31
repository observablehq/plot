import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

if (import.meta.vitest) {
  await import("../plot.js").then((_) => _.declareTests(import.meta.filename));
}

export async function letterFrequencyColumn() {
  const alphabet = await d3.csv<any>("data/alphabet.csv", d3.autoType);
  return Plot.plot({
    x: {
      label: null
    },
    y: {
      label: "Frequency (%)",
      transform: (y) => y * 100,
      grid: true
    },
    marks: [Plot.barY(alphabet, {x: "letter", y: "frequency"}), Plot.ruleY([0])]
  });
}
