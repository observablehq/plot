import * as Plot from "@observablehq/plot";

export default async function() {
  return Plot.plot({
    x: {
      tickFormat: "%"
    },
    marks: [
      Plot.barX({length: 20}, Plot.stackX({
        x: (d, i) => i,
        fill: (d, i) => i,
        insetLeft: 1,
        offset: "expand"
      }))
    ]
  });
}
