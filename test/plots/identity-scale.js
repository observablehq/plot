import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

const random = d3.randomLcg(42);

export default async function() {
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
      Plot.dot({length: 100}, {
        x: () => 600 * random(),
        y: () => 100 + 500 * random(),
        fill: () => "red",
        stroke: () => "blue"
      })
    ]
  });
}
