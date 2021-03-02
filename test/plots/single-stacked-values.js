import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const data = d3.range(1, 20).map(d => d * (20 - d));
  return Plot.plot({
    x: {
      tickFormat: "%"
    },
    color: {
      scheme: "rdbu"
    },
    marks: [
      Plot.stackBarX(data, {
        y: null,
        x: d => d,
        fill: d => d,
        stroke: "black",
        offset: "expand"
      })
    ]
  });
}
