import * as Plot from "@observablehq/plot";

export default async function() {
  return Plot.plot({
    color: {
      type: "ordinal"
    },
    marks: [
      Plot.cellX("ABCDEFGHIJKLMNOPQRSTUVWXYZ", {fill: d => d})
    ]
  });
}
