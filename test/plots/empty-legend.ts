import * as Plot from "@observablehq/plot";
import {test} from "test/plot";

test(async function emptyLegend() {
  return Plot.plot({
    color: {
      legend: true // ignored because no color scale
    },
    marks: [Plot.frame()]
  });
});
