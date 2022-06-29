import * as Plot from "@observablehq/plot";

export default async function () {
  return Plot.plot({
    x: {
      tickFormat: "%"
    },
    marks: [
      Plot.rectX(
        {length: 20},
        {
          x: (d, i) => i,
          fill: (d, i) => i,
          insetLeft: 1,
          offset: "expand"
        }
      )
    ]
  });
}
