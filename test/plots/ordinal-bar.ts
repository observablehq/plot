import * as Plot from "@observablehq/plot";
import {test} from "test/plot";

test(async function ordinalBar() {
  return Plot.plot({
    y: {
      grid: true
    },
    marks: [Plot.barY("ABCDEF"), Plot.ruleY([0])]
  });
});
