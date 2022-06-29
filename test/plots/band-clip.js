import * as Plot from "@observablehq/plot";

export default async function () {
  return Plot.plot({
    y: {type: "band"},
    marks: [
      Plot.frame(),
      Plot.text(["A", "B", "C"], {
        x: (d) => d,
        y: (d) => d,
        clip: true,
        fontSize: 50
      })
    ]
  });
}
