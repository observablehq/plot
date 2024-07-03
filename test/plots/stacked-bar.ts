import * as Plot from "@observablehq/plot";

export async function stackedBar() {
  return Plot.plot({
    x: {
      tickFormat: "%"
    },
    marks: [
      Plot.barX(
        {length: 20},
        Plot.stackX({
          x: (d, i) => i,
          fill: (d, i) => i,
          insetLeft: 1,
          offset: "normalize"
        })
      )
    ]
  });
}
