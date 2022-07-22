import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function () {
  const decathlon = await d3.csv("data/decathlon.csv", d3.autoType);
  return Plot.plot({
    grid: true,
    inset: 12,
    symbol: {
      legend: true
    },
    marks: [Plot.dot(decathlon, {x: "Long Jump", y: "100 Meters", symbol: "Country", stroke: "Country"})]
  });
}
