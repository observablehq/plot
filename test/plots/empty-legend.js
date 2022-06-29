import * as Plot from "@observablehq/plot";

export default async function () {
  return Plot.plot({
    color: {
      legend: true // ignored because no color scale
    },
    marks: [Plot.frame()]
  });
}
