import * as Plot from "@observablehq/plot";
import {test} from "test/plot";

test(async function singleValueBin() {
  return Plot.rectY([3], Plot.binX()).plot();
});
