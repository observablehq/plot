import * as Plot from "@observablehq/plot";

export default async function () {
  return Plot.plot({
    grid: true,
    x: {
      domain: [0, 1],
      axis: null
    },
    marks: [Plot.frame()]
  });
}
