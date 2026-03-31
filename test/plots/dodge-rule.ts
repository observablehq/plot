import * as Plot from "@observablehq/plot";
import {test} from "test/plot";

test(async function dodgeRule() {
  return Plot.ruleX([1, 2, 3], Plot.dodgeY()).plot();
});
