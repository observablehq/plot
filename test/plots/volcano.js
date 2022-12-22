import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function () {
  const dem = await d3.json("data/volcano.json");
  return Plot.plot({
    y: {
      reverse: true
    },
    marks: [
      Plot.imageData({imageRendering: "auto", width: dem.width, height: dem.height, fill: dem.values}),
      Plot.frame()
    ]
  });
}
