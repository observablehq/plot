import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const data = await d3.csv("data/diamonds.csv", d3.autoType);
  return Plot.plot({
    height: 640,
    color: {
      scheme: "bupu",
      type: "symlog"
    },
    marks: [
      Plot.bin(data, {x: "carat", y: "price", thresholds: 100})
    ]
  });
}
