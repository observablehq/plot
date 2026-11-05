import * as Plot from "@observablehq/plot";
import {test} from "test/plot";

test(async function groupedRects() {
  return Plot.plot({
    marks: [Plot.rectY({length: 10}, Plot.groupX({y: "count"}, {x: (d, i) => "ABCDEFGHIJ"[i]}))]
  });
});
