import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function () {
  const volcano = await d3.json("data/volcano.json");
  return Plot.plot({
    marks: [
      Plot.raster(volcano.values, {width: volcano.width, height: volcano.height, fill: volcano.values}),
      Plot.frame()
    ]
  });
}
