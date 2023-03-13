import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function diamondsCaratPriceDots() {
  const data = await d3.csv<any>("data/diamonds.csv", d3.autoType);
  return Plot.plot({
    height: 640,
    grid: true,
    marginLeft: 44,
    x: {
      label: "Carats →"
    },
    y: {
      label: "↑ Price ($)"
    },
    r: {
      domain: [0, 100],
      range: [0, 3]
    },
    marks: [Plot.dot(data, Plot.bin({r: "count"}, {x: "carat", y: "price", thresholds: 100}))]
  });
}
