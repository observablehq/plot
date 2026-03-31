import * as Plot from "@observablehq/plot";
import {test} from "test/plot";

test(async function collapsedHistogram() {
  return Plot.rectY([1, 1, 1], Plot.binX()).plot();
});
