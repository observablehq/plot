import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

if (import.meta.vitest) {
  await import("../plot.js").then((_) => _.declareTests(import.meta.filename));
}

export async function hexbinSymbol() {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.plot({
    grid: true,
    symbol: {
      legend: true
    },
    marks: [Plot.dot(penguins, Plot.hexbin({r: "count"}, {symbol: "sex", x: "culmen_depth_mm", y: "culmen_length_mm"}))]
  });
}
