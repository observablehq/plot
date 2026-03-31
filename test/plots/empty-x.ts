import * as Plot from "@observablehq/plot";
import {test} from "test/plot";

test(async function emptyX() {
  return Plot.plot({
    grid: true,
    x: {
      domain: [0, 1],
      axis: null
    },
    marks: [Plot.frame()]
  });
});
