import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function identityScale() {
  const random = d3.randomLcg(42);
  return Plot.plot({
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
      Plot.dot(
        {length: 100},
        {
          x: () => 600 * random(),
          y: () => 100 + 500 * random(),
          fill: () => "red",
          stroke: () => "blue"
        }
      )
    ]
  });
}
