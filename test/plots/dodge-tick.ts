import * as Plot from "@observablehq/plot";
import {test} from "test/plot";

test(async function dodgeTick() {
  return Plot.tickX([1, 2, 3], Plot.dodgeY()).plot();
});
