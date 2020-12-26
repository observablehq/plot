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
      domain: [0, 100]
    },
    marks: [
      Plot.dot(data, {
        transform: Plot.bin2({x: "carat", y: "price", thresholds: 100}),
        x: d => (d.x0 + d.x1) / 2,
        y: d => (d.y0 + d.y1) / 2,
        r: "length"
      })
    ]
  });
}
