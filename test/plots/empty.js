import * as Plot from "@observablehq/plot";

export default async function() {
  return Plot.plot({
    grid: true,
    inset: 6,
    x: {
      domain: [0, 1]
    },
    y: {
      domain: [0, 1]
    }
  });
}
