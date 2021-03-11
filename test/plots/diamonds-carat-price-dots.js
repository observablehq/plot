import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const data = await d3.csv("data/diamonds.csv", d3.autoType);
  return Plot.plot({
    height: 640,
    grid: true,
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
    marks: [
      Plot.dot(data, Plot.binR({x: "carat", y: "price", thresholds: 100}))
    ]
  });
}
