import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {test} from "test/plot";

test(async function untypedDateBin() {
  const aapl = await d3.csv<any>("data/aapl.csv");
  return Plot.plot({
    y: {
      transform: (d) => d / 1e6
    },
    marks: [Plot.rectY(aapl, Plot.binX({y: "sum"}, {x: "Date", thresholds: "month", y: "Volume"})), Plot.ruleY([0])]
  });
});
