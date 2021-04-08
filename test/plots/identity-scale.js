import * as Plot from "@observablehq/plot";

export default async function() {
  return Plot.plot({
    height: 396,
    x: {
      type: "identity"
    },
    y: {
      type: "identity"
    },
    color: {
      type: "identity"
    },
    marks: [
      Plot.dot({length: 100}, {
        x: () => 600 * Math.random(),
        y: () => 100 + 500 * Math.random(),
        fill: () => "red",
        stroke: () => "blue"
      })
    ]
  });
}
