import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function decathlon() {
  const decathlon = await d3.csv<any>("data/decathlon.csv", d3.autoType);
  return Plot.plot({
    grid: true,
    inset: 12,
    symbol: {
      legend: true
    },
    marks: [Plot.dot(decathlon, {x: "Long Jump", y: "100 Meters", symbol: "Country", stroke: "Country"})]
  });
}
