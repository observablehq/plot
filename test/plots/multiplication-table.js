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
      Plot.rect(nums, {fy: nums, fill: nums}),
      Plot.dot(nums, {
        frameAnchor: "middle",
        r: 19,
        fill: nums,
        stroke: "white",
        fx: nums
      }),
      Plot.text(d3.cross(nums, nums), {
        frameAnchor: "middle",
        text: ([a, b]) => a * b,
        fill: "white",
        fx: (d) => d[1],
        fy: (d) => d[0]
      })
    ]
  });
}
