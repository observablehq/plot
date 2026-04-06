import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {test} from "test/plot";

test(async function metroUnemploymentSlope() {
  const bls = await d3.csv<any>("data/bls-metro-unemployment.csv", d3.autoType);
  return Plot.plot({
    y: {
      grid: true
    },
    color: {
      scheme: "buylrd",
      domain: [-0.5, 0.5]
    },
    marks: [
      Plot.line(
        bls,
        Plot.map(
          {stroke: Plot.window({k: 2, reduce: "difference"})},
          {x: "date", y: "unemployment", z: "division", stroke: "unemployment"}
        )
      ),
      Plot.ruleY([0])
    ]
  });
});
