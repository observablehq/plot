import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function () {
  const nums = d3.range(2, 10);
  return Plot.plot({
    height: 450,
    width: 450,
    color: {type: "ordinal", scheme: "tableau10"},
    fx: {axis: "top"},
    marks: [
      Plot.rect(nums, {facet: {y: nums}, fill: nums}),
      Plot.dot(nums, {
        frameAnchor: "middle",
        r: 19,
        fill: (d) => d,
        stroke: "white",
        facet: {x: (d) => d}
      }),
      Plot.text(d3.cross(nums, nums), {
        frameAnchor: "middle",
        text: ([a, b]) => a * b,
        fill: "white",
        facet: {x: (d) => d[1], y: (d) => d[0]}
      })
    ]
  });
}
