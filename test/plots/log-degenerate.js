import * as Plot from "@observablehq/plot";

export default async function() {
  return Plot.plot({
    x: {
      type: "log"
    },
    marks: [
      Plot.dotX([0, 0.1, 1, 2, 10])
    ]
  });
}
