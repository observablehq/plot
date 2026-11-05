import * as Plot from "@observablehq/plot";
import {test} from "test/plot";

test(async function markerDasharray() {
  return Plot.plot({
    axis: null,
    inset: 20,
    marks: [
      Plot.lineY(
        [
          [0, 5],
          [5, 2],
          [10, 0]
        ],
        {
          x: (d) => d[0],
          y: (d) => d[1],
          strokeDasharray: "1,10",
          strokeWidth: 3,
          markerStart: "dot",
          markerMid: "arrow",
          markerEnd: "circle-stroke"
        }
      )
    ]
  });
});

test(async function markerRuleX() {
  return Plot.ruleX([1, 2, 3], {marker: "arrow-reverse", inset: 3}).plot();
});

test(async function markerRuleY() {
  return Plot.ruleY([1, 2, 3], {marker: "arrow-reverse", inset: 3}).plot();
});

test(async function markerTickX() {
  return Plot.tickX([1, 2, 3], {marker: "arrow-reverse", inset: 3}).plot();
});

test(async function markerTickY() {
  return Plot.tickY([1, 2, 3], {marker: "arrow-reverse", inset: 3}).plot();
});
