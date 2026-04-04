import * as Plot from "@observablehq/plot";
import {test} from "test/plot";

test(function areaLine() {
  return Plot.plot({
    width: 300,
    height: 200,
    insetTop: 10,
    marks: [
      Plot.frame(),
      Plot.areaY([1, 3, 2, 5, 8, 6, 4, 7, 9, 3], {
        line: true,
        stroke: "steelblue",
        strokeWidth: 2,
        fill: "steelblue",
        marker: "circle",
        markerEnd: "arrow"
      })
    ]
  });
});
