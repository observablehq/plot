import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function () {
  const vapor = await d3.json("data/vapor.json");
  return Plot.plot({
    projection: "equal-earth",
    color: {scheme: "oranges"},
    marks: [
      Plot.raster(vapor, {
        fill: (d) => d,
        x: (d, i) => (i % 360) - 180,
        y: (d, i) => 90 - ((i / 360) | 0),
        rasterize: "nearest",
        clip: "sphere"
      }),
      Plot.sphere()
    ]
  });
}
