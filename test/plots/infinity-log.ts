import * as Plot from "@observablehq/plot";
import {test} from "test/plot";

test(async function infinityLog() {
  return Plot.dotX([NaN, 0.2, 0, 1, 2, 1 / 0]).plot({x: {type: "log", tickFormat: "f"}});
});
