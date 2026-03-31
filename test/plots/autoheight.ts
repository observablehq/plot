import * as Plot from "@observablehq/plot";
import {test} from "test/plot";

test(async function autoHeightEmpty() {
  return Plot.rectY([], {x: "date", y: "visitors", fy: "path"}).plot();
});
