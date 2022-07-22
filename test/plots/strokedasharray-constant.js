import * as Plot from "@observablehq/plot";

const data = Array.from(["none", "10 5", [20, 3], [30, 5, 10, 10], null],
  (strokeDasharray) => Array.from([0, 2, 20, 60, NaN],
    (strokeDashoffset) => ({strokeDasharray, strokeDashoffset})
  )
).flat();

export default async function() {
  return Plot.plot({
    height: 640,
    x: {inset: 10},
    y: {inset: 10},
    axis: null,
    facet: {data, x: "strokeDasharray", y: "strokeDashoffset"},
    marks: [
      Plot.frame(),
      Plot.arrow(data, {
        x1: 0,
        x2: 1,
        y1: 0,
        y2: 1,
        strokeDasharray: "1,2,3",
        strokeDashoffset: "strokeDashoffset",
        bend: true,
        headLength: 0
      })
    ]
  });
}